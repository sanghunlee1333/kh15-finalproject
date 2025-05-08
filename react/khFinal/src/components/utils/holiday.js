import axios from "axios";

export const fetchHolidays = async (year, month) => {
  const response = await axios.get(`/holidays`, {
    params: { year, month }
  });
  return response.data;
};