const calculateReadingTime = (articleBody: string) => {
  return Math.ceil(articleBody.split(/\s+/).length / 238);
};

export default calculateReadingTime;
