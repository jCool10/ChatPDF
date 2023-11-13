import { toast } from "@/components/ui/use-toast";
import AWS from "aws-sdk";

export const uploadToS3 = async (file: File) => {
  try {
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
    });
    const s3 = new AWS.S3({
      params: {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      },
      region: "ap-southeast-1",
    });

    const fileKey = Date.now().toString() + "-" + file.name.replace(" ", "-");

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
      Body: file,
    };

    const upload = s3
      .putObject(params)
      .on("httpUploadProgress", (evt) => {
        toast({
          // variant: "destructive",
          title: "AWS S3",
          description: `Up load to S3 ... ${parseInt(
            ((evt.loaded * 100) / evt.total).toString()
          )}%`,
        });
      })
      .promise();

    await upload.then((data) => {
      console.log("successfully uploaded to S3!", fileKey);
    });

    return Promise.resolve({
      fileKey,
      fileName: file.name,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getS3Url = (file_key: string) => {
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/${file_key}`;
  return url;
};
