import { BlobWriter, TextReader, ZipWriter } from "https://unpkg.com/@zip.js/zip.js/index.js";

onmessage = async (e) => {
    const feedback = `Your score is ${e.rightAns} correct answer/s out of ${e.count} questions!\n\n${e.text.join('')}`;

    const zipWriter = new ZipWriter(new BlobWriter("application/zip"));
    await zipWriter.add("QuizResult.txt", new TextReader(feedback));
    const blob = await zipWriter.close()
    postMessage(blob)
};