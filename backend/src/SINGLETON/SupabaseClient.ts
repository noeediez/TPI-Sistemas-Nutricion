import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export class SupabaseClientSingleton {

    private static instancia: SupabaseClient | null = null;

    private constructor() {}

    public static getInstancia(): SupabaseClient {

        if (SupabaseClientSingleton.instancia === null) {

            const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
            const key = process.env.SUPABASE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            if (!url || !key) {
                throw new Error("Faltan las variables SUPABASE_URL y SUPABASE_KEY");
            }

            SupabaseClientSingleton.instancia = createClient(url, key);
        }

        return SupabaseClientSingleton.instancia;
    }
}

export const supabase = SupabaseClientSingleton.getInstancia();