import {NextFunction, Request, Response} from "express"
import {StatusCodes} from "http-status-codes"
import {ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings} from "@langchain/google-genai";
import {HNSWLib} from "@langchain/community/vectorstores/hnswlib";
import {StringOutputParser} from '@langchain/core/output_parsers';
import {ChatPromptTemplate} from '@langchain/core/prompts';
import {RunnablePassthrough, RunnableSequence} from '@langchain/core/runnables';
import {formatDocumentsAsString} from "langchain/util/document";
import {VECTOR_STORE_PATH} from "../constant";
import {systemMessages} from "../functions";
import {logger} from "../utils/logger";

export const triggerRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = req.body;
        const { question, query, response } = data;

        if(!question) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: `no question or image passed` });
            return;
        }

        const model = new ChatGoogleGenerativeAI({
            temperature: 1,
            modelName: 'gemini-1.5-pro'
        });

        const embeddings = new GoogleGenerativeAIEmbeddings();
        let vectorStore: HNSWLib;

        vectorStore = await HNSWLib.load(VECTOR_STORE_PATH, embeddings);

        const vectorStoreRetriever = vectorStore.asRetriever();

        const messages = systemMessages(query, response);

        const retriever = {
            context: vectorStoreRetriever.pipe(formatDocumentsAsString),
            question: new RunnablePassthrough(),
        }

        const prompt = ChatPromptTemplate.fromMessages(messages);
        const chain = RunnableSequence.from([
            retriever,
            prompt,
            model,
            new StringOutputParser(),
        ]);
        let answer = await chain.invoke(question);
        return res.status(StatusCodes.OK).json({ message: answer });
    } catch (e:any) {
        logger.error(e);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: `internal server error ${e.message}` });
    }
}
