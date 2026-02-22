import MessMenu from '../models/MessMenu.js';

// 1. नया मील ऐड करना
export const addMeal = async (req, res) => {
  try {
    const { hostelName, mealType, items } = req.body;
    const newMeal = await MessMenu.create({
      hostelName,
      mealType,
      items,
      addedBy: req.user.id
    });
    res.status(201).json({ success: true, meal: newMeal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. सभी मील प्राप्त करना (यही नाम राउट्स में चाहिए)
export const getAllMeals = async (req, res) => {
  try {
    const meals = await MessMenu.find().sort({ date: -1 });
    res.status(200).json({ success: true, meals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. मील डिलीट करना
export const deleteMeal = async (req, res) => {
  try {
    await MessMenu.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Meal deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};