from fileinput import filename
from operator import index
from typing import Any, Union, List
from pydantic import BaseModel
from fastapi import FastAPI
import ast

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}

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
