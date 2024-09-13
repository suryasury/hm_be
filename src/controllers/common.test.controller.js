const { getPreSignedUrl } = require("../controllers/common.controller");
const { S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");

jest.mock("@aws-sdk/client-s3");
jest.mock("@aws-sdk/s3-request-presigner");

describe("getPreSignedUrl function", () => {
  const mockS3Client = {
    send: jest.fn(),
  };

  const mockGetObjectCommand = {
    input: {
      Bucket: "mock-bucket-name",
      Key: "mock-file-path",
    },
  };

  const mockGetSignedUrl = jest.fn().mockResolvedValue("mock-presigned-url");

  beforeEach(() => {
    S3Client.mockImplementation(() => mockS3Client);
    GetObjectCommand.mockImplementation(() => mockGetObjectCommand);
    getSignedUrl.mockImplementation(mockGetSignedUrl);
  });

  it("should return a valid presigned URL for an existing file", async () => {
    const filePath = "mock-file-path";
    const expectedUrl = "mock-presigned-url";

    await expect(getPreSignedUrl(filePath)).resolves.toEqual(expectedUrl);

    expect(mockS3Client.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: mockGetObjectCommand.input,
      }),
    );

    expect(getSignedUrl).toHaveBeenCalledWith(
      mockS3Client,
      expect.objectContaining({
        input: mockGetObjectCommand.input,
      }),
      { expiresIn: 3600 },
    );
  });
});
