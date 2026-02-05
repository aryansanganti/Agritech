#!/usr/bin/env python3
import csv
import random

# Real Indian districts grouped by state
districts_by_state = {
    "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
    "Telangana": ["Adilabad", "Hyderabad", "Karimnagar", "Khammam", "Mahbubnagar", "Medak", "Nalgonda", "Nizamabad", "Rangareddy", "Warangal"],
    "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
    "Karnataka": ["Bagalkot", "Bangalore", "Belgaum", "Bellary", "Bidar", "Bijapur", "Chamarajanagar", "Chikmagalur", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Gulbarga", "Hassan", "Haveri", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysore", "Raichur", "Shimoga", "Tumkur", "Udupi", "Uttara Kannada"],
    "Tamil Nadu": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "The Nilgiris", "Theni", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
    "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
    "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
    "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
    "Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
    "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
    "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
    "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
    "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
    "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahebganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
    "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
    "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Mohali", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Shaheed Bhagat Singh Nagar", "Tarn Taran"],
    "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
    "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
    "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
    "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
    "Goa": ["North Goa", "South Goa"]
}

# Climate zone configurations with realistic ranges
climate_configs = {
    "Arid": {
        "rainfall": (200, 600),
        "temp": (38, 48),
        "salinity": (0.8, 3.5),
        "tribal": (0, 15)
    },
    "Semi-Arid": {
        "rainfall": (400, 900),
        "temp": (35, 44),
        "salinity": (0.4, 2.0),
        "tribal": (5, 35)
    },
    "Tropical Wet-Dry": {
        "rainfall": (800, 1600),
        "temp": (32, 42),
        "salinity": (0.2, 1.2),
        "tribal": (10, 50)
    },
    "Humid Subtropical": {
        "rainfall": (1200, 2200),
        "temp": (28, 38),
        "salinity": (0.1, 0.8),
        "tribal": (2, 25)
    },
    "Coastal": {
        "rainfall": (1500, 3500),
        "temp": (30, 36),
        "salinity": (0.5, 2.5),
        "tribal": (1, 20)
    },
    "Mountain": {
        "rainfall": (800, 1800),
        "temp": (20, 32),
        "salinity": (0.1, 0.5),
        "tribal": (15, 60)
    }
}

soil_types = ["Clay", "Black", "Red Sandy", "Alluvial", "Loamy", "Red Loam", "Laterite"]

# State-specific climate zone preferences
state_climate_zones = {
    "Rajasthan": ["Arid", "Semi-Arid"],
    "Gujarat": ["Arid", "Semi-Arid", "Coastal"],
    "Maharashtra": ["Semi-Arid", "Tropical Wet-Dry"],
    "Karnataka": ["Semi-Arid", "Tropical Wet-Dry", "Coastal"],
    "Tamil Nadu": ["Tropical Wet-Dry", "Coastal", "Semi-Arid"],
    "Andhra Pradesh": ["Tropical Wet-Dry", "Coastal", "Semi-Arid"],
    "Telangana": ["Semi-Arid", "Tropical Wet-Dry"],
    "Odisha": ["Tropical Wet-Dry", "Coastal", "Humid Subtropical"],
    "West Bengal": ["Humid Subtropical", "Tropical Wet-Dry"],
    "Bihar": ["Humid Subtropical", "Tropical Wet-Dry"],
    "Uttar Pradesh": ["Semi-Arid", "Humid Subtropical"],
    "Madhya Pradesh": ["Semi-Arid", "Tropical Wet-Dry"],
    "Chhattisgarh": ["Tropical Wet-Dry", "Humid Subtropical"],
    "Jharkhand": ["Tropical Wet-Dry", "Humid Subtropical"],
    "Kerala": ["Coastal", "Humid Subtropical"],
    "Assam": ["Humid Subtropical", "Mountain"],
    "Punjab": ["Semi-Arid", "Humid Subtropical"],
    "Haryana": ["Semi-Arid", "Humid Subtropical"],
    "Himachal Pradesh": ["Mountain", "Humid Subtropical"],
    "Uttarakhand": ["Mountain", "Humid Subtropical"],
    "Goa": ["Coastal", "Humid Subtropical"]
}

# Generate realistic lat/lng for Indian states (approximate centroids)
state_coords = {
    "Andhra Pradesh": (15.9129, 79.7400),
    "Telangana": (18.1124, 79.0193),
    "Maharashtra": (19.7515, 75.7139),
    "Karnataka": (15.3173, 75.7139),
    "Tamil Nadu": (11.1271, 78.6569),
    "Odisha": (20.9517, 85.0985),
    "West Bengal": (22.9868, 87.8550),
    "Madhya Pradesh": (22.9734, 78.6569),
    "Uttar Pradesh": (26.8467, 80.9462),
    "Bihar": (25.0961, 85.3131),
    "Rajasthan": (27.0238, 74.2179),
    "Gujarat": (22.2587, 71.1924),
    "Chhattisgarh": (21.2787, 81.8661),
    "Jharkhand": (23.6102, 85.2799),
    "Haryana": (29.0588, 76.0856),
    "Punjab": (31.1471, 75.3412),
    "Assam": (26.2006, 92.9376),
    "Kerala": (10.8505, 76.2711),
    "Himachal Pradesh": (31.1048, 77.1734),
    "Uttarakhand": (30.0668, 79.0193),
    "Goa": (15.2993, 74.1240)
}

def generate_realistic_data():
    rows = []
    for state, districts in districts_by_state.items():
        state_lat, state_lng = state_coords.get(state, (20, 78))
        climate_zones = state_climate_zones.get(state, ["Tropical Wet-Dry", "Semi-Arid"])
        
        for district in districts:
            # Randomize position around state centroid
            lat = round(state_lat + random.uniform(-2, 2), 4)
            lng = round(state_lng + random.uniform(-2, 2), 4)
            
            # Pick climate zone
            climate_zone = random.choice(climate_zones)
            config = climate_configs[climate_zone]
            
            # Generate realistic varied values
            rainfall = random.randint(*config["rainfall"])
            temp = random.randint(*config["temp"])
            salinity = round(random.uniform(*config["salinity"]), 2)
            tribal = round(random.uniform(*config["tribal"]), 1)
            soil = random.choice(soil_types)
            
            rows.append({
                "district": district,
                "state": state,
                "lat": lat,
                "lng": lng,
                "soil_ec_ds_m": salinity,
                "max_temp_c": temp,
                "annual_rainfall_mm": rainfall,
                "tribal_percent": tribal,
                "soil_type": soil,
                "climate_zone": climate_zone
            })
    
    return rows

# Generate data
data = generate_realistic_data()

# Write to CSV
with open('india_district_climate_640.csv', 'w', newline='') as f:
    fieldnames = ["district", "state", "lat", "lng", "soil_ec_ds_m", "max_temp_c", "annual_rainfall_mm", "tribal_percent", "soil_type", "climate_zone"]
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(data)

print(f"Generated {len(data)} realistic district records!")
