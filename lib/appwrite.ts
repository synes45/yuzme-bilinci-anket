import { Client, Databases, ID, Query } from 'appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!;

export type SurveyResponse = {
    id?: string;
    answers: Record<string, string | number>;
    started_at: string;
    submitted_at: string;
    duration_ms: number;
}

// Veri Kaydetme
export async function saveResponseToDB(response: SurveyResponse) {
    try {
        await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
                answers: JSON.stringify(response.answers), // Obje -> String dönüşümü
                started_at: response.started_at,
                submitted_at: response.submitted_at,
                duration_ms: response.duration_ms
            }
        );
    } catch (error) {
        console.error("Kayıt hatası:", error);
        throw error;
    }
}

// Verileri Çekme (Analiz sayfası için)
export async function getAllResponsesFromDB() {
    try {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        return response.documents.map(doc => ({
            id: doc.$id,
            answers: JSON.parse(doc.answers), // String -> Obje dönüşümü
            started_at: doc.started_at,
            submitted_at: doc.submitted_at,
            duration_ms: doc.duration_ms
        })) as SurveyResponse[];
    } catch (error) {
        console.error("Veri çekme hatası:", error);
        return [];
    }
}

// Tüm Verileri Silme
export async function clearAllFromDB() {
    try {
        const docs = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        for (const doc of docs.documents) {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
        }
    } catch (error) {
        console.error("Silme hatası:", error);
    }
}