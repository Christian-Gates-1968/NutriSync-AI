import {React,useState,useMemo,useEffect,useCallback} from 'react';
import { useDropzone } from 'react-dropzone';
// @mui material components
import Card from "@mui/material/Card";

// Vision UI Dashboard React components
import VuiBox from "components/VuiBox";
import VuiTypography from "components/VuiTypography";

// Vision UI Dashboard React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Table from "examples/Tables/Table";

// Data
import authorsTableData from "layouts/tables/data/authorsTableData";
import projectsTableData from "layouts/tables/data/projectsTableData";

import "./Meal.css"
import MealList from "./MealList"; //*********** */
import { ContentCutOutlined } from '@mui/icons-material';


import Calendarr from 'layouts/Calendarr';


const viewSettings = {
    timeline: {
        type: 'week',
        eventList: true
    }
};

const responsivePopup = {
    medium: {
        display: 'center',
        width: 400,
        fullScreen: false,
        touchUi: false,
        showOverlay: false
    }
};



/////////////////////////////////////////////////////////////////////////////////////////

function Tables(props) {   ///////////////////////////////////chacnged from {cal } to props and props.cal
    const [mealData, setMealData] = useState(null);
    const [calories, setCalories] = useState(props.cal);
    console.log("CALORIES TABLES=",props.cal);
    const extractElement = (data, element) => {
      return data.map((idx) => {
          return idx[element];
      })
    }
    
    var minCal=parseInt(props.cal)>2000?props.cal:parseInt(props.cal)+2000;
    console.log("CALORIES EATEN YESTERDAY=",props.cal);
    console.log("MIN CALORIES TO BE EATEN=",minCal);

    function getMealData() {
      var minCal=parseInt(props.cal)>2000?props.cal:parseInt(props.cal)+2000;
      console.log("CALORIES EATEN YESTERDAY=",props.cal);
      console.log("MIN CALORIES TO BE EATEN=",minCal);
      setCalories(`${minCal}`);
      fetch(
        `https://api.spoonacular.com/mealplanner/generate?apiKey=6108d1daaf3c4778b47d1d120303bafd&timeFrame=day&targetCalories=${props.cal}`
      )
        .then((response) => response.json())
        .then((data) => { 
          //var datee=new Date().getDay();console.log("date=",datee);
          //setCalories(extractElement(weekData, 'Calories')[datee-1]);//ADDED THIS TO MEAL PLANNNER*******
          //console.log("EXTRACTED+",extractElement(weekData, 'Calories')[datee-1]);               //RETURNS AN ARRAY FROM 0-6******
          setMealData(data);})
        .catch(() => {
          console.log("error");
        });
    }

  const { columns, rows } = authorsTableData;
  const { columns: prCols, rows: prRows } = projectsTableData;

  /////////////////////////////////////////////////////////////////////////////\
  const [myMeals, setMyMeals] = useState();
  const [tempMeal, setTempMeal] = useState();
  const [isOpen, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [name, setName] = useState('');
  const [caloriesx, setCaloriesx] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [notes, setNotes] = useState('');
  const [headerText, setHeader] = useState('');
  const [type, setType] = useState(1);

  // Food image upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [analyzeSuccess, setAnalyzeSuccess] = useState('');
  const [loggedMeals, setLoggedMeals] = useState([]);

  // react-dropzone configuration
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploadedFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAnalyzeError('');
    setAnalyzeSuccess('');

    // Automatically send to backend for analysis
    setAnalyzing(true);
    const formData = new FormData();
    formData.append('foodImage', file);

    fetch('http://localhost:9000/api/food/analyze-image', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setName(data.food || '');
          setCaloriesx(String(data.macros.calories || ''));
          setProtein(String(data.macros.protein || ''));
          setCarbs(String(data.macros.carbs || ''));
          setFat(String(data.macros.fat || ''));
          setAnalyzeSuccess(`Detected: ${data.food}`);
        } else {
          setAnalyzeError(data.error || 'Analysis failed');
        }
      })
      .catch((err) => {
        console.error(err);
        setAnalyzeError('Could not connect to analysis server');
      })
      .finally(() => setAnalyzing(false));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10 MB
  });

  const clearUpload = () => {
    setUploadedFile(null);
    setImagePreview(null);
    setAnalyzeError('');
    setAnalyzeSuccess('');
  };

  const handleLogMeal = () => {
    if (!name || !caloriesx) return;
    setLoggedMeals((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        calories: caloriesx,
        protein,
        carbs,
        fat,
        notes,
        image: imagePreview,
        time: new Date().toLocaleTimeString(),
      },
    ]);
    // Reset form
    setName('');
    setCaloriesx('');
    setProtein('');
    setCarbs('');
    setFat('');
    setNotes('');
    clearUpload();
  };

  /////////////////////////////////////////////////////////////////////////////
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <VuiBox py={3}>

        {/* ========== FOOD LOGGING FORM WITH IMAGE UPLOAD ========== */}
        <VuiBox mb={3}>
          <Card>
            <VuiBox p={3}>
              <VuiTypography variant="lg" color="white" fontWeight="bold" mb="12px">
                📸 Log a Meal — Snap &amp; Track
              </VuiTypography>
              <VuiTypography variant="button" color="text" fontWeight="regular" mb="20px">
                Upload a photo of your food and we'll estimate the macros automatically.
              </VuiTypography>

              <div className="food-log-grid">
                {/* ---------- Dropzone ---------- */}
                <div className="food-log-dropzone-col">
                  {!imagePreview ? (
                    <div
                      {...getRootProps()}
                      className={`food-dropzone ${isDragActive ? 'food-dropzone--active' : ''}`}
                    >
                      <input {...getInputProps()} />
                      <div className="food-dropzone-inner">
                        <span className="food-dropzone-icon">📷</span>
                        {isDragActive ? (
                          <p>Drop the image here…</p>
                        ) : (
                          <>
                            <p>Drag &amp; drop a food photo here</p>
                            <p className="food-dropzone-hint">or click to browse</p>
                            <p className="food-dropzone-formats">JPEG, PNG, WebP — up to 10 MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="food-preview-wrapper">
                      <img src={imagePreview} alt="Food preview" className="food-preview-img" />
                      <button onClick={clearUpload} className="food-preview-clear" title="Remove image">✕</button>
                      {analyzing && (
                        <div className="food-analyzing-overlay">
                          <div className="food-spinner" />
                          <span>Analyzing…</span>
                        </div>
                      )}
                    </div>
                  )}
                  {analyzeSuccess && <p className="food-success-msg">✅ {analyzeSuccess}</p>}
                  {analyzeError && <p className="food-error-msg">⚠️ {analyzeError}</p>}
                </div>

                {/* ---------- Form Fields ---------- */}
                <div className="food-log-fields-col">
                  <div className="food-field">
                    <label className="food-label">Food Name</label>
                    <input
                      type="text"
                      className="food-input"
                      placeholder="e.g. Grilled Chicken"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="food-macros-row">
                    <div className="food-field">
                      <label className="food-label">🔥 Calories</label>
                      <input
                        type="number"
                        className="food-input food-input--cal"
                        placeholder="kcal"
                        value={caloriesx}
                        onChange={(e) => setCaloriesx(e.target.value)}
                      />
                    </div>
                    <div className="food-field">
                      <label className="food-label">🥩 Protein</label>
                      <input
                        type="number"
                        className="food-input food-input--protein"
                        placeholder="g"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                      />
                    </div>
                    <div className="food-field">
                      <label className="food-label">🍞 Carbs</label>
                      <input
                        type="number"
                        className="food-input food-input--carbs"
                        placeholder="g"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                      />
                    </div>
                    <div className="food-field">
                      <label className="food-label">🧈 Fat</label>
                      <input
                        type="number"
                        className="food-input food-input--fat"
                        placeholder="g"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="food-field">
                    <label className="food-label">Notes (optional)</label>
                    <input
                      type="text"
                      className="food-input"
                      placeholder="e.g. Post-workout meal"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <button
                    className="food-log-btn"
                    onClick={handleLogMeal}
                    disabled={!name || !caloriesx}
                  >
                    ➕ Log This Meal
                  </button>
                </div>
              </div>

              {/* ---------- Logged Meals Table ---------- */}
              {loggedMeals.length > 0 && (
                <div className="food-logged-section">
                  <VuiTypography variant="button" color="white" fontWeight="bold" mb="8px">
                    Today's Logged Meals
                  </VuiTypography>
                  <div className="food-logged-list">
                    {loggedMeals.map((m) => (
                      <div key={m.id} className="food-logged-card">
                        {m.image && <img src={m.image} alt={m.name} className="food-logged-thumb" />}
                        <div className="food-logged-info">
                          <strong>{m.name}</strong>
                          <span className="food-logged-time">{m.time}</span>
                          <div className="food-logged-macros">
                            <span className="macro-tag macro-tag--cal">{m.calories} kcal</span>
                            <span className="macro-tag macro-tag--protein">{m.protein}g P</span>
                            <span className="macro-tag macro-tag--carbs">{m.carbs}g C</span>
                            <span className="macro-tag macro-tag--fat">{m.fat}g F</span>
                          </div>
                          {m.notes && <span className="food-logged-notes">{m.notes}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </VuiBox>
          </Card>
        </VuiBox>

        {/* ========== EXISTING MEAL PLAN SECTION ========== */}
        <VuiBox mb={3}>
          <Card>
            <VuiBox display="flex" justifyContent="space-between" alignItems="center" mb="22px">
              <VuiTypography variant="lg" color="white">
                Customize your Meal 
                <section className="controls" style={{paddingLeft:20,paddingTop:-10}}>
         <VuiTypography variant="lg" color="white"> 
         Consume a minimum of {minCal} calories for energizing yourself
         </VuiTypography>               
         <br></br>
        <button onClick={getMealData} className="MealButton">Get Daily Meal Plan</button>
      </section>
      {mealData && <MealList mealData={mealData} />}
              </VuiTypography>
            </VuiBox>
            <VuiBox
              sx={{
                "& th": {
                  borderBottom: ({ borders: { borderWidth }, palette: { grey } }) =>
                    `${borderWidth[1]} solid ${grey[700]}`,
                },
                "& .MuiTableRow-root:not(:last-child)": {
                  "& td": {
                    borderBottom: ({ borders: { borderWidth }, palette: { grey } }) =>
                      `${borderWidth[1]} solid ${grey[700]}`,
                  },
                },
              }}
            >
            </VuiBox>
          </Card>
        </VuiBox>
      </VuiBox>
      <Footer />
  {/*//////////////////////////////////////////////////////////////////////// */}
   <div style={{fontWeight:"700",color:"white",background:"rgba (0, 0, 0, 0.5)"}}>
     <Calendarr/>
  </div>
{/*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/}
    </DashboardLayout>
  );
}

export default Tables;
