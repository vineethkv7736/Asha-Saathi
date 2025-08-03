# 🔬 Dynamic Screening System - BabyAssist AI

## 🎯 **Overview**

The screening system is now **dynamic and person-specific**, allowing healthcare workers to conduct AI-powered health screenings for individual mothers and children. Each screening is automatically associated with the specific person, ensuring proper data organization and tracking.

## 🏗️ **System Architecture**

### **URL Structure**
```
/screening/[type]/[id]
```

**Parameters:**
- `type`: Either `mother` or `child`
- `id`: The unique identifier of the person

**Examples:**
- `/screening/mother/123e4567-e89b-12d3-a456-426614174000`
- `/screening/child/987fcdeb-51a2-43d1-b789-123456789abc`

### **Database Schema**

#### **Screenings Table**
```sql
CREATE TABLE public.screenings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    person_id UUID NOT NULL,           -- Links to mother or child
    person_type TEXT CHECK (person_type IN ('mother', 'child')),
    image_url TEXT,                    -- Optional: stored image URL
    analysis_results JSONB NOT NULL,   -- AI analysis results
    notes TEXT,                        -- Additional notes
    risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 **How It Works**

### **1. Access Screening**
- **From Mothers Grid**: Click "Screen" button → `/screening/mother/{id}`
- **From Children Grid**: Click "Screen" button → `/screening/child/{id}`
- **Direct URL**: Navigate directly to the screening URL

### **2. Person Loading**
```typescript
// Automatically loads person data based on type and ID
if (type === 'mother') {
  personData = await motherService.getById(id);
} else if (type === 'child') {
  personData = await childService.getById(id);
}
```

### **3. Dynamic Analysis**
- **Mother Screening**: Analyzes maternal health indicators
- **Child Screening**: Analyzes child development and health

### **4. Automatic Association**
```typescript
// Screening results are automatically linked to the person
const screeningData = {
  person_id: person.id,
  person_type: person.type, // 'mother' or 'child'
  analysis_results: analysisResults,
  notes: screeningNotes,
  risk_level: analysisResults.riskLevel
};
```

## 📊 **Screening Types**

### **🤰 Mother Screening**
**Health Indicators:**
- Blood Pressure
- Weight
- Skin Tone
- Edema Detection
- Anemia Signs
- Overall Health Assessment

**AI Analysis Results:**
```json
{
  "bloodPressure": "120/80 mmHg",
  "weight": "65 kg",
  "skinTone": "Normal",
  "edema": "Not detected",
  "anemia": "Not detected",
  "overallHealth": "Good",
  "riskLevel": "low",
  "recommendations": [
    "Continue regular prenatal care",
    "Monitor blood pressure weekly",
    "Maintain healthy diet and exercise"
  ]
}
```

### **👶 Child Screening**
**Health Indicators:**
- Height and Weight
- Skin Tone
- Jaundice Detection
- Anemia Signs
- Eye Condition
- Spinal Alignment
- Overall Development

**AI Analysis Results:**
```json
{
  "height": "68 cm",
  "weight": "7.2 kg",
  "skinTone": "Normal",
  "jaundice": "Not detected",
  "anemia": "Mild signs detected",
  "eyeCondition": "Normal",
  "spinalAlignment": "Normal",
  "overallHealth": "Good",
  "riskLevel": "low",
  "recommendations": [
    "Monitor iron levels due to mild anemia signs",
    "Continue regular feeding schedule",
    "Schedule next checkup in 2 weeks"
  ]
}
```

## 🎨 **User Interface Features**

### **1. Person Information Card**
- **Icon**: Mother (👩) or Child (👶) icon
- **Name**: Person's name
- **Type**: Mother/Child badge
- **ID**: Unique identifier

### **2. Photo Upload**
- **Drag & Drop**: Easy image upload
- **Preview**: Real-time image preview
- **Validation**: File type and size validation

### **3. Analysis Results**
- **Risk Level**: Color-coded badges (Low/Medium/High)
- **Measurements**: Person-specific health metrics
- **Recommendations**: AI-generated health advice
- **Notes**: Additional observations field

### **4. Action Buttons**
- **Save to Profile**: Stores results in database
- **Schedule Follow-up**: Plan next screening

## 🔧 **Technical Implementation**

### **Database Services**
```typescript
// Screening service for CRUD operations
export const screeningService = {
  async create(screeningData): Promise<Screening | null>
  async getByPersonId(personId, personType): Promise<Screening[]>
  async getById(id): Promise<Screening | null>
  async update(id, updates): Promise<Screening | null>
  async delete(id): Promise<boolean>
}
```

### **Navigation Integration**
```typescript
// Easy access from grids
router.push(`/screening/${type}/${id}`)

// Examples:
router.push(`/screening/mother/${mother.id}`)
router.push(`/screening/child/${child.id}`)
```

## 📱 **Mobile Responsiveness**

### **Responsive Design**
- **Mobile**: Optimized for phone screens
- **Tablet**: Enhanced layout for tablets
- **Desktop**: Full-featured interface

### **Touch-Friendly**
- **Large Buttons**: Easy to tap on mobile
- **Swipe Navigation**: Smooth transitions
- **Loading States**: Clear feedback during operations

## 🔒 **Security & Privacy**

### **Data Protection**
- **RLS Policies**: Row-level security for all data
- **Authentication**: Only authenticated users can access
- **Person Association**: Data linked to specific individuals

### **Access Control**
```sql
-- RLS policies ensure data isolation
CREATE POLICY "Allow authenticated users to read screenings" 
ON public.screenings FOR SELECT 
USING (auth.role() = 'authenticated');
```

## 🚀 **Benefits**

### **✅ For Healthcare Workers**
- **Person-Specific**: Each screening is linked to the right person
- **Easy Access**: One-click screening from grids
- **Comprehensive**: Full health assessment for each type
- **Organized**: All data properly categorized

### **✅ For Data Management**
- **Structured**: Clear data relationships
- **Searchable**: Easy to find specific screenings
- **Trackable**: History of all screenings per person
- **Scalable**: Handles multiple people efficiently

### **✅ For Healthcare Quality**
- **Consistent**: Standardized screening process
- **Comprehensive**: Covers all health indicators
- **Actionable**: Clear recommendations for follow-up
- **Documented**: Complete screening history

## 🔄 **Workflow Example**

1. **Navigate to Mothers/Children page**
2. **Click "Screen" button** on any person
3. **Upload photo** for AI analysis
4. **Review results** and add notes
5. **Save to profile** - automatically linked to person
6. **Schedule follow-up** if needed

## 📈 **Future Enhancements**

### **Planned Features**
- **Screening History**: View all past screenings per person
- **Trend Analysis**: Track health changes over time
- **Alert System**: Notify about concerning results
- **Export Reports**: Generate screening reports
- **Integration**: Connect with other health systems

---

**🎉 The dynamic screening system provides a comprehensive, person-specific health assessment tool that automatically organizes and tracks all screening data!** 