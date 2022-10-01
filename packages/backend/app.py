from fastapi import FastAPI
import openai
import os

openai.api_key = os.getenv("OPENAI_API_KEY")
app = FastAPI()


def count_tokens(s):
    return len(s) / 4  # len(tokenizer(s)["attention_mask"])


@app.get("/")
async def root():
    old = """def solution(rectangles):
        points = set()
        for x1, y1, x2, y2 in rectangles:
            for x in range(x1, x2):
                for y in range(y1, y2):
                    points.add((x, y))
        return len(points)"""
    new = """def solution(rectangles):
        return len({(x, y) for x1, y1, x2, y2 in rectangles for x in range(x1, x2) for y in range(y1, y2)})"""
    explain_change(old, new)
    return {"message": "Hello World"}


def improve_code(code):
    pass


def explain_change(initial_code, new_code):
    query_string = f"""{initial_code}

    {new_code}

    The new code is more elegant because it """
    result = openai.Completion.create(
        model="text-davinci-002",
        prompt=query_string,
        max_tokens=64,
        temperature=0,
        stop=["---", '"""'],
    )
    print(result["choices"][0]["text"])
    print(result["usage"]["completion_tokens"])
    return result["choices"][0]["text"]
