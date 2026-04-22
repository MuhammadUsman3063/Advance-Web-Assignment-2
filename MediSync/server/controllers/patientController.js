const Patient = require('../models/Patient');
// 🚨 BUG FIXED: PatientHistory model import karna bhool gaye the!
const PatientHistory = require('../models/PatientHistory'); 

// @desc    Register new patient & generate token
// @route   POST /api/patients/register
// @access  Private
exports.registerPatient = async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Please provide name and phone number' });
    }

    const lastPatient = await Patient.findOne().sort({ createdAt: -1 });
    const nextToken = lastPatient && lastPatient.tokenNumber ? lastPatient.tokenNumber + 1 : 1;

    const patient = new Patient({
      name,
      phone,
      tokenNumber: nextToken,
      status: 'Pending'
    });

    await patient.save();

    res.status(201).json({ message: 'Patient registered successfully', patient });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.find({ status: { $ne: 'Completed' } }).sort({ tokenNumber: 1 });
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    await patient.deleteOne();
    res.status(200).json({ message: 'Token cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

exports.callNextPatient = async (req, res) => {
  try {
    await Patient.updateMany({ status: 'Active' }, { status: 'Completed' });

    const nextPatient = await Patient.findOne({ status: 'Pending' }).sort({ tokenNumber: 1 });

    if (!nextPatient) {
      return res.status(200).json({ message: 'Queue is empty', patient: null });
    }

    nextPatient.status = 'Active';
    await nextPatient.save();

    res.status(200).json({ message: 'Next patient called', patient: nextPatient });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// 🌟 SMART LOGIC: Ab yeh Aaj ke completed aur Purani history dono dikhayega!
exports.getPatientHistory = async (req, res) => {
  try {
    // 1. Aaj ke wo patients jo treat ho chuke hain (Completed)
    const todaysCompleted = await Patient.find({ status: 'Completed' }).lean();
    
    // Unko history jaisa structure dena taake frontend error na de
    const formattedTodaysCompleted = todaysCompleted.map(p => ({
      _id: p._id,
      name: p.name,
      phone: p.phone,
      tokenNumber: p.tokenNumber,
      status: p.status,
      archivedAt: p.updatedAt || p.createdAt || new Date().toISOString()
    }));

    // 2. Purani History jo raat 12 baje archive hui thi
    const pastHistory = await PatientHistory.find({}).lean();

    // 3. Dono arrays ko mila do aur Date ke hisaab se Sort kar do (Latest sabse upar)
    const combinedHistory = [...formattedTodaysCompleted, ...pastHistory].sort((a, b) => {
      return new Date(b.archivedAt) - new Date(a.archivedAt);
    });

    res.status(200).json(combinedHistory);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching history', error: error.message });
  }
};