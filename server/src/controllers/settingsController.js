const Settings = require('../models/Settings');

exports.getSettings = async (_req, res) => {
  try {
    const settings = await Settings.findOne();

    res.status(200).json({
      success: true,
      message: 'Settings fetched successfully',
      data: settings || { notifyEmail: '' },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const notifyEmail = req.body.notifyEmail?.trim() || '';

    const settings = await Settings.findOneAndUpdate(
      {},
      { notifyEmail },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    res.status(200).json({
      success: true,
      message: 'Settings saved successfully',
      data: settings,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
