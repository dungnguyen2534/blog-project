const getTopArticleListDateFilter = (timeSpan: string) => {
  const currentDate = new Date();
  let endDate: Date | undefined;

  switch (timeSpan) {
    case "week":
      endDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
      break;
    case "month":
      endDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
      break;
    case "year":
      endDate = new Date(
        currentDate.setFullYear(currentDate.getFullYear() - 1)
      );
      break;
    case "infinity":
      endDate = new Date(0);
      break;
    default:
      endDate = undefined;
  }

  return endDate;
};

export default getTopArticleListDateFilter;
