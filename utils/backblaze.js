import B2 from "backblaze-b2";

const b2 = new B2({
  applicationKeyId: '3271776e6f04',
  applicationKey: '005ce0e9f877eb330605585293b5b7f3f2359ac2ab'
});

export const initB2 = async () => {
  await b2.authorize();
};


export default b2;