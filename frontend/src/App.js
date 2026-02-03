// src/App.js
import React from 'react';
import JurnalTable from './components/JurnalTable';

function App() {
  // Gunakan data dummy ini untuk memastikan tabel muncul di browser
  const dataDummy = [
    {
      nama: "Insisiva Dental Journal: Majalah Kedokteran Gigi Insisiva",
      issn: "2338-6313", 
      univ: "Universitas Muhammadiyah Yogyakarta", // Sesuai data UMY yang kamu punya
      email: "idj@umy.ac.id",
      tlpn: "08123456789",
      sinta_score: "3",
      // Gunakan domain terbaru yang kamu temukan tadi agar tidak Error 404
      url_sinta: "https://sinta.kemdiktisaintek.go.id/journals/detail?id=6789"
    }
  ];

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-5 text-center">Database Jurnal DIY (Internal Admin)</h1>
      <div className="bg-white shadow-md rounded-lg p-5">
        <JurnalTable dataJurnal={dataDummy} />
      </div>
    </div>
  );
}

export default App;