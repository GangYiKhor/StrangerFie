import { uploadFileDto } from "@/dto/uploadFileDto";
import mergeImages from "../../../utils/mergeImages";
import localRemoveBgServices from "./localRemoveBgServices";
import blurFacesServices from "./blurFacesServices";
import { uploadFileResponses } from "@/responses/uploadFileResponses";
import prisma from "@/utils/prismaClient";

export default async function uploadFileServices(
	body: uploadFileDto
): Promise<uploadFileResponses> {
	if (!body?.image) {
		throw new Error();
	}

	const imageBuffer = Buffer.from(body.image.split(",")[1], "base64");
	const personImageBuffer = await localRemoveBgServices(imageBuffer);

	const { id } = await prisma.images.create({
		data: {
			image_blob: imageBuffer,
			blurred_image_blob: imageBuffer,
			person_image_blob: personImageBuffer,
			blurred_person_image_blob: imageBuffer,
			archived: false,
		},
	});

	blurFacesServices(imageBuffer).then(async (blurredImageBuffer) => {
		if (process.env.NODE_ENV === "development") {
			console.log("Blurred Face Received!");
		}
		const blurredPersonImageBuffer = await localRemoveBgServices(
			blurredImageBuffer
		);

		await prisma.images.update({
			data: {
				blurred_image_blob: blurredImageBuffer,
				blurred_person_image_blob: blurredPersonImageBuffer,
			},
			where: {
				id,
			},
		});
	});

	const result = await prisma.publish_image.findFirstOrThrow({
		select: {
			background_image: true,
			image: true,
		},
		where: {
			archived: false,
		},
	});

	const mergedImage = await mergeImages(
		result.image ?? result.background_image,
		[personImageBuffer]
	);
	const onlyCurrentImage = await mergeImages(result.background_image, [
		personImageBuffer,
	]);

	return {
		mergedImage: "data:image/jpeg;base64," + mergedImage.toString("base64"),
		onlyCurrentImage:
			"data:image/jpeg;base64," + onlyCurrentImage.toString("base64"),
		id: id.toString(),
	};
}
