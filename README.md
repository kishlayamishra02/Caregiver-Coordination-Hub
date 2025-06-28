# 🌿 Caregiver Coordination Hub

<div align="center">
  <img src="https://raw.githubusercontent.com/Arjit74/Caregiver-Coordination-Hub/main/assets/logo192.png" alt="Caregiver Hub Banner" width="700"/>

  **A project by Team UnityLink for CS Base Hack4Health 2025**  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Online-brightgreen?style=for-the-badge&logo=netlify)](https://caregiverhub.netlify.app)
  [![Timeline](https://img.shields.io/badge/Project_Timeline-View_Here-blue?style=for-the-badge)](https://projectdeadline.netlify.app/)
</div>

---

## ✨ At a Glance

| Category | Details |
|----------|---------|
| **Purpose** | Simplify care coordination for families and healthcare teams |
| **Tech Stack** | React, Firebase, MUI, TypeScript |
| **Deployment** | Netlify + Firebase Hosting |
| **Key Features** | Real-time task management, shared calendar, secure notes |
| **Team** | 4 developers (see below) |

<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase" />
  <img src="https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript" />
</div>

---

## 🌟 Why Caregiver Hub?

> “Because caregiving shouldn’t feel like a second job.”

We built this platform to solve three key problems:

1. ✅ **Coordination Chaos** – Avoid missed medications and conflicting appointments  
2. 📌 **Information Silos** – Keep everyone on the same page with collaborative notes  
3. ❤️ **Caregiver Burnout** – Lighten the mental load with smart, automated reminders

---

## 🖥️ Key Features

### 📅 Unified Care Calendar
<div align="center">
  <img src="https://raw.githubusercontent.com/Arjit74/Caregiver-Coordination-Hub/main/assets/Calenderpic.png" width="600" alt="Calendar Screenshot"/>
</div> 

---

### 💊 Medication Tracker
<div align="center">
  <img src="https://raw.githubusercontent.com/Arjit74/Caregiver-Coordination-Hub/main/assets/Medication_Tasks.png" width="600" alt="Medication Screenshot"/>
</div> 

---

### 📝 Collaborative Notes
```markdown
[12/05] Dr. Smith Visit:
- BP: 120/80 ✅ 
- New prescription: Lipitor 10mg
- Next visit in 3 weeks
```

---

### 🔔 Notification System
- Browser push alerts  
- SMS fallback *(coming soon)*  
- Daily summary emails *(planned)*

---

## 🛠 Technical Deep Dive

### 🔄 Architecture
<div align="center">
  <img src="https://raw.githubusercontent.com/Arjit74/Caregiver-Coordination-Hub/main/assets/Flowchart.png" width="700" alt="Architecture Flowchart"/>
</div>

---

### 🧩 Code Highlight

```ts
// Sample from our task service
interface CareTask {
  id: string;
  title: string;
  due: FirebaseTimestamp;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  notes?: string;
}

const addTask = async (task: Omit<CareTask, 'id'>) => {
  const docRef = await addDoc(collection(db, 'tasks'), task);
  return { ...task, id: docRef.id };
};
```

---

## 👥 Meet Team UnityLink

| Name | Role |
|------|------|
| [Kishlaya Mishra](https://github.com/kishlayamishra02) | 🧠 Team Lead, Deployment, Coordination |
| [Arjit Sharma](https://github.com/Arjit74) | 🔁 Full Stack Developer (Integration, Docs, Firebase) |
| [Ramam](https://github.com/RamamAgarwal) | 🎨 Frontend Developer (UI/UX, React) |
| [Madhav](https://github.com/madhavofficial) | 🔧 Backend Developer (Firebase, API) |

---

## 🚀 Getting Started

### 🔧 Quick Setup
```bash
git clone https://github.com/Arjit74/Caregiver-Coordination-Hub.git
cd Caregiver-Coordination-Hub
npm install
cp .env.example .env
npm start
```

### 🔥 Firebase Configuration

1. Create a project in [Firebase Console](https://console.firebase.google.com)  
2. Enable **Firestore** and **Authentication**  
3. Add a web app and paste the config in your `.env`:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

## 📈 What's Next?

| Feature | Status |
|---------|--------|
| 📱 Mobile App (React Native) | Planned Q3 2025 |
| 🗣️ Voice Command Integration | Research Phase |
| 🌐 Offline Mode | In Design |
| 👥 Care Team Roles | In Development |

---

## 🙏 Acknowledgments

- ❤️ React & Material-UI for beautiful components  
- 🔥 Firebase for real-time backend magic  
- 🧑‍⚕️ Hack4Health 2025 mentors and organizers  
- 👩‍👩‍👧‍👦 Every caregiver who inspired this project

---

## 📞 Support

Need help or want to contribute?

- [Open an issue](https://github.com/Arjit74/Caregiver-Coordination-Hub/issues)  
- Reach out via GitHub  
- Join our community (Slack/Discord coming soon!)

---

## 📄 License

This project is licensed under the **MIT License** – see the [LICENSE](https://opensource.org/licenses/MIT) file for full details.

---

<div align="center"> 
  <br/>
  <strong>Built with ❤️ for caregivers everywhere</strong>  
  <br/><br/> 
  <img src="https://raw.githubusercontent.com/Arjit74/Caregiver-Coordination-Hub/main/assets/logo192.png" width="160" alt="Caregiver Hub Logo"/>  
</div>
