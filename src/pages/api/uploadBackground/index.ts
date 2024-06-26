import { NextApiRequest, NextApiResponse } from "next";
import uploadBackgroundServices from "./uploadBackgroundServices";

async function uploadFileHandler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === "POST") {
		try {
			await uploadBackgroundServices(req.body);
			res.status(200).end();
		} catch (err) {
			if (process.env.NODE_ENV === "development") {
				console.error(err);
			}
			res.status(500).end();
		}
	} else {
		res.status(400).end();
	}
}

export default uploadFileHandler;
