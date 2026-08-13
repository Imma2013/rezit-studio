const projectId = process.env.FIREBASE_PROJECT_ID;

const authConfig = {
  providers: [
    {
      domain: `https://securetoken.google.com/${projectId}`,
      applicationID: projectId,
    },
  ],
};

export default authConfig;
