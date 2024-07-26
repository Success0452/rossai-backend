import {DirectoryLoader} from "langchain/document_loaders/fs/directory";
import {MODEL_PATH, SECRET_KEY_JSON, SYSTEM_TEMPLATE} from "../constant";
import {TextLoader} from "langchain/document_loaders/fs/text";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {ImageAnnotatorClient} from "@google-cloud/vision";
import { GoogleAuth } from "google-auth-library";
import path from "path";
import {HumanMessagePromptTemplate, SystemMessagePromptTemplate, AIMessagePromptTemplate} from "@langchain/core/prompts";

export const splitDocs = async() => {
    const normalizeDocuments = (docs: any[]) => {
        return docs.map((doc) => {
            if (typeof doc.pageContent === 'string') {
                return doc.pageContent;
            } else if (Array.isArray(doc.pageContent)) {
                return doc.pageContent.join('\n');
            }
        });
    };

    console.log('Creating vector store...');
    const loader = new DirectoryLoader(MODEL_PATH, {
        '.txt': (path) => new TextLoader(path),
    });

    const docs = await loader.load();
    const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
    const normalizedDocs = normalizeDocuments(docs);
    return await textSplitter.createDocuments(normalizedDocs);
}

export const systemMessages = (query:string, response:string) => {
    const messages = [
        SystemMessagePromptTemplate.fromTemplate(SYSTEM_TEMPLATE),
        HumanMessagePromptTemplate.fromTemplate('What is your role?'),
        AIMessagePromptTemplate.fromTemplate('I am RossAI, an AI developed to paint beautiful scenes with AI-guided Bob Ross style instructions. My purpose is to create stunning and serene landscapes by interpreting and visualizing detailed user-provided descriptions in the style of Bob Ross. My role includes providing artistic guidance, explaining painting techniques, and helping users bring their creative visions to life. How may I help you create your masterpiece?'),
    ];

    if(query && query.length > 0) {
        messages.push(HumanMessagePromptTemplate.fromTemplate(query));
    }

    if(response && response.length > 0) {
        messages.push(AIMessagePromptTemplate.fromTemplate(query));
    }

    messages.push(HumanMessagePromptTemplate.fromTemplate('{question}'));
    return messages;
}

export const analyzeImage = async(imageBase64:any) => {
    const auth = new GoogleAuth({
        keyFilename: path.resolve(__dirname, '../../gen.json'),
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = new ImageAnnotatorClient({ auth });
    const [result] = await client.labelDetection({
        image: { content: imageBase64 },
    });
    const labels = result.labelAnnotations || [];
    console.log(labels.map(label => label.description).join(', '))
    return  labels.map(label => label.description).join(', ');
}

