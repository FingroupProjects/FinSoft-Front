import goodsDeleteApi from "../../api/documents/goodsDelete";

export default async function goodsDelete (data) {
  try {
    const res = await goodsDeleteApi.delete({ ids: data });
  } catch (e) {
    console.error(e);
  }
};