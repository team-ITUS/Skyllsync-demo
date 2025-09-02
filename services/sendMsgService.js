const axios = require("axios");
const { WACREDModel } = require("../models/waCredModel");

//get whatapp credential
const getWACred = async () => {
  let waCredDtl = null;
  try {
    const waCredDtl = await WACREDModel.findOne({});
    return waCredDtl;
  } catch (error) {
    return waCredDtl;
  }
};

const sendWAMsg = async (sendTo, msg) => {
  try {
    let jid = `91${sendTo}@s.whatsapp.net`;
    
    const waApiDtl = await getWACred();
    
    if (waApiDtl === null) {
      return false;
    }

    const response = await axios.get(waApiDtl?.apiUrl, {
      params: {
        token: waApiDtl?.token,
        instance_id: waApiDtl?.instanceId,
        jid: jid,
        msg: msg,
      },
    });

   
    if (response.data.success) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

module.exports = { sendWAMsg };
