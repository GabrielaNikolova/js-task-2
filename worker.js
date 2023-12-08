import { BlobWriter, TextReader, ZipWriter } from "https://unpkg.com/@zip.js/zip.js/index.js";

onmessage = async (e) => {
    const { rightAns, count, text } = e.data;

    const feedback = `Your score is ${rightAns} correct answer/s out of ${count} questions!\n\n${text.join('')}`;

    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
    await zipWriter.add("QuizResult.txt", new TextReader(feedback));
    const blob = await zipWriter.close()
    postMessage(blob)
};