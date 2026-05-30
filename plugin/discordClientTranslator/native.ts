import { IpcMainInvokeEvent, net } from "electron";

export async function makeTranslateRequest(
    _: IpcMainInvokeEvent,
    baseUrl: string,
    apiKey: string,
    payload: string
) {
    return new Promise<{ status: number; data: string; }>(resolve => {
        try {
            const url = `${baseUrl}/v1/chat/completions`;
            const req = net.request({ method: "POST", url });

            req.setHeader("Content-Type", "application/json");
            req.setHeader("Authorization", `Bearer ${apiKey}`);

            let data = "";
            let status = -1;

            req.on("response", response => {
                status = response.statusCode;
                response.on("data", chunk => { data += chunk.toString(); });
                response.on("end", () => resolve({ status, data }));
                response.on("error", () => resolve({ status, data }));
            });

            req.on("error", e => {
                resolve({ status: -1, data: `net.request error: ${String(e)}` });
            });

            req.write(payload);
            req.end();
        } catch (e) {
            resolve({ status: -1, data: `native exception: ${String(e)}` });
        }
    });
}
