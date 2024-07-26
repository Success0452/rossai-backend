import {ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings} from "@langchain/google-genai";
import {HNSWLib} from "@langchain/community/vectorstores/hnswlib";
import {StringOutputParser} from '@langchain/core/output_parsers';
import {ChatPromptTemplate} from '@langchain/core/prompts';
import {RunnablePassthrough, RunnableSequence} from '@langchain/core/runnables';
import {formatDocumentsAsString} from "langchain/util/document";
import {VECTOR_STORE_PATH} from "../constant";
import {systemMessages} from "../functions";

export const triggerStreamRequest = async (data:any, socket: any) => {
    try {
        const { question, query, response } = data;

        if(!question) {
            console.log('No question passed');
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
        const eventStream = chain.streamEvents(question, { version: 'v1' });
        for await (const e of eventStream) {
            const event = e?.event;
            if (event == 'on_llm_stream') {
                socket.emit('on_chain_stream', e.data?.chunk);
            }
            if (event == 'on_llm_end') {
                socket.emit('on_chain_end', e?.data?.output?.generations[0][0]);
            }
        }
    } catch (e:any) {
        console.log(e);
        socket.emit('on_chain_end', 'Internal Server Error');
    }
}
