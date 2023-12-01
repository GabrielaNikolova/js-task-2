import { BlobWriter, TextReader, ZipWriter } from "https://unpkg.com/@zip.js/zip.js/index.js";

onmessage = async (e) => {
    const { rightAns, count } = e.data;
    const text = `Your score is ${rightAns} correct answer/s out of ${count} questions!`;
    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
    await zipWriter.add("QuizResult.txt", new TextReader(text))
    const blob = await zipWriter.close()
    postMessage(blob)
};