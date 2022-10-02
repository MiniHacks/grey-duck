from fileinput import filename
from operator import index
from typing import Any, Union, List, Tuple
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
import openai
import os
import difflib  # this is in the stdlib? based.
import ast

openai.api_key = os.getenv("OPENAI_API_KEY")
app = FastAPI()


def count_tokens(s):
    return len(s) // 4


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/example")
async def example():
    old = """def solution(rectangles):
        points = set()
        for x1, y1, x2, y2 in rectangles:
            for x in range(x1, x2):
                for y in range(y1, y2):
                    points.add((x, y))
        return len(points)"""
    new = improve_code(old)
    exp = explain_change(old, new)
    return {"improved_code": new, "explanation": exp}


def improve_code(code: str) -> str:
    query_string = f"""rewrite the function elegantly

    {code}
    """
    result = openai.Completion.create(
        model="text-davinci-002",
        prompt=query_string,
        max_tokens=count_tokens(query_string),
        temperature=0,
        stop=["---", '"""'],
    )
    return result["choices"][0]["text"]


def explain_change(initial_code, new_code):
    query_string = f"""{initial_code}

    {new_code}

    The new code is elegant because """
    result = openai.Completion.create(
        model="text-davinci-002",
        prompt=query_string,
        max_tokens=128,
        temperature=0,
        stop=["---", '"""', "\n\n"],
    )
    generated_text = result["choices"][0]["text"]
    return "\n".join([x.strip().capitalize() for x in generated_text.split("\n")])

class SplitPyFileReqBody(BaseModel):
    file_text: str

    # filename of python file
    filename: str = '<string>'

    cursor_line: int
    cursor_character: int

@app.post("/improve_pyfile")
async def split_large_py_file(
    py_file: SplitPyFileReqBody
):
    return improve_all_code(py_file.file_text, py_file.filename)


    
def split_py_file_items(items: List[Any]) -> List[Union[List[Any], ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef]]:
    indexes_of_interesting_items = []
    for i, item in enumerate(items):
        if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            indexes_of_interesting_items.append(i)


    ret = []
    remaining_items = items
    offset = 0
    for idx in indexes_of_interesting_items:
        idx = idx - offset
        if idx > 0:
            ret.append(remaining_items[:idx])
        ret.append(remaining_items[idx])
        remaining_items = remaining_items[idx+1:]
        offset += idx + 1
    
    if remaining_items:
        ret.append(remaining_items)


    return ret

def turn_split_item_into_line_ranges(items: Union[List[Any], ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef]) -> List[Tuple[int, int]]:
    if isinstance(items, list):
        first = items[0].lineno
        last = items[-1].end_lineno
    else:
        first = items.lineno
        last = items.end_lineno
    
    # the lines are 1 indexed when coming out of the AST, so subtract the first one by 1
    return first - 1, last

class ImprovementResults(BaseModel):
    file_ranges: List[Tuple[int, int]]
    improved_sections: List[str]
    explanations: List[str]

def improve_all_code(all_code: str, filename: str = "<string>") -> ImprovementResults:
    code_lines = all_code.splitlines()

    try:
        py_file_items: List[Any] = ast.parse(
            source = all_code,
            filename = filename
        ).body

        # split up AST item list to separate functions from things chillin in the top level
        split_items = split_py_file_items(py_file_items)
        file_ranges = [turn_split_item_into_line_ranges(item) for item in split_items]

        sections_to_improve = ["\n".join(code_lines[start:end]) for start, end in file_ranges]
        improved_sections = [improve_code(section) for section in sections_to_improve]
        explanations = {
            i: explain_change(old, new)
            for i, (old, new) in enumerate(zip(sections_to_improve, improved_sections))
            if is_change_needed(old, new)
        }

        return ImprovementResults(
            file_ranges=[file_ranges[i] for i in explanations.keys()],
            improved_sections=[improved_sections[i] for i in explanations.keys()],
            explanations=list(explanations.values())
        )
    except SyntaxError:
        raise HTTPException(400, "Syntatically invalid python")

def is_change_needed(old_py: str, new_py: str) -> bool:
    """Check if old code and new code is meaningfully different. 
    
    Implementation is based on string diffing the human readable representations of python AST
    """
    try:
        old_ast = ast.dump(ast.parse(old_py), indent=1)
        new_ast = ast.dump(ast.parse(new_py), indent=1)
        seq_matcher = difflib.SequenceMatcher(a=old_ast, b=new_ast)

        ratio = seq_matcher.ratio()
        ret = ratio < 0.7
        if not ret:
            print("###################################")
            print("old code:")
            print(old_py)
            print("---------------------")
            print("new code:")
            print(new_py)
            print("--------------")
            print(f"sim score of {ratio}")
            print("###################################")

        return ret
    except SyntaxError:
        return False
