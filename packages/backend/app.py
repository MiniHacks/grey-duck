from fileinput import filename
from operator import index
from typing import Any, Union, List
from pydantic import BaseModel
from fastapi import FastAPI
import openai
import os
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


def improve_code(code):
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
        max_tokens=64,
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

@app.post("/split_large_py_file")
async def split_large_py_file(
    py_file: SplitPyFileReqBody
):
    py_ast: ast.Module = ast.parse(
        source = py_file.file_text,
        filename = py_file.filename
    )

    py_file_items: List[Any] = py_ast.body

    print("file items: ", py_file_items)
    split_items = split_py_file_items(py_file_items)
    print("split items: ", split_items)
    split_items = [turn_split_items_back_into_code(py_file.file_text, items) for items in split_items]

    print("split items: ", split_items)
    return split_items


    
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

def turn_split_items_back_into_code(og_source: str, items: Union[List[Any], ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef]) -> str:
    lines = og_source.splitlines()
    if isinstance(items, list):
        first = items[0].lineno
        last = items[-1].end_lineno
    else:
        first = items.lineno
        last = items.end_lineno
    
    print(f"{first=}, {last=}")
    return lines[first-1:last]