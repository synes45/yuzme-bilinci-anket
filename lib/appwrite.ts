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
    age: string;    
    gender: string; 
    // Analiz sayfasının mutlu olması için bu yapıyı koruyoruz
    demographics?: {
        age: number;
        gender: string;
    };
}

// Veri Kaydetme
// Veri Kaydetme - Parametreleri tek tek alacak şekilde güncelledik
export async function saveResponseToDB(
    answers: Record<string, string | number>, 
    startedAt: string, 
    age: string, 
    gender: string
) {
    try {
        const submitted_at = new Date().toISOString();
        const duration_ms = new Date(submitted_at).getTime() - new Date(startedAt).getTime();

        await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            {
                answers: JSON.stringify(answers),
                started_at: startedAt,
                submitted_at: submitted_at,
                duration_ms: duration_ms,
                age: String(age),
                gender: gender 
            }
        );
    } catch (error) {
        console.error("Kayıt hatası:", error);
        throw error;
    }
}

// Verileri Çekme (Analiz sayfası için optimize edildi)
export async function getAllResponsesFromDB(): Promise<SurveyResponse[]> {
    try {
        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(100) // Daha fazla veri için limiti artırabilirsin
        ]);
        
        return response.documents.map(doc => {
            // Yaş verisini sayıya çeviriyoruz (Analiz sayfasındaki grafikler için)
            const ageNum = parseInt(doc.age) || 0;
            const genderStr = doc.gender || "Belirtilmemiş";

            return {
                id: doc.$id,
                answers: JSON.parse(doc.answers),
                started_at: doc.started_at,
                submitted_at: doc.submitted_at,
                duration_ms: doc.duration_ms,
                age: doc.age || "0",
                gender: genderStr,
                // KRİTİK NOKTA: Analiz sayfasındaki r.demographics?.age hatasını 
                // burada objeyi oluşturarak çözüyoruz.
                demographics: {
                    age: ageNum,
                    gender: genderStr
                }
            };
        }) as SurveyResponse[];
    } catch (error) {
        console.error("Veri çekme hatası:", error);
        return [];
    }
}

// Tüm Verileri Silme
export async function clearAllFromDB() {
    try {
        const docs = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [Query.limit(100)]);
        for (const doc of docs.documents) {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, doc.$id);
        }
    } catch (error) {
        console.error("Silme hatası:", error);
        throw error;
    }
}