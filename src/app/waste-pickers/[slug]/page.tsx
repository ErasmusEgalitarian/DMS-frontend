"use client";

import {fetchMeasurementsByUserId, fetchWastePickerById} from '@/lib/api';
import React, {useEffect, useMemo, useState} from "react";
import {User} from "@/app/waste-pickers/page";
import styles from "./styles.module.css";
import {use} from "react";
import {Bar} from "react-chartjs-2";
import {Chart as ChartJS, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);


interface ParamsType {
  params: Promise<{ slug: string }>;
}

interface GroupedData {
  [date: string]: {
    totalWaste: number;
    totalPrice: number;
    wasteTypes: { [type: string]: number };
  };
}

export default function UserPage({params}: ParamsType) {
  const {slug} = use(params);

  const [loading, setLoading] = useState<boolean>(true);
  const [measurementsData, setMeasurementsData] = useState<any>([]);
  const [userData, setUserData] = useState<User | null>(null);

  const [groupedData, setGroupedData] = useState<GroupedData>({});
  const [selectedMonth, setSelectedMonth] = useState("2024-01");

  const initialGroupedData = useMemo(() => {
    const initialGrouped = {};
    measurementsData.forEach((item) => {
      const date = new Date(item.measurement.timestamp * 1000).toISOString().split("T")[0];
      if (!initialGrouped[date]) initialGrouped[date] = {totalWaste: 0, totalPrice: 0, wasteTypes: {}};
      initialGrouped[date].totalWaste += item.measurement.weight;
      initialGrouped[date].totalPrice += item.total_price;

      const wasteType = item.measurement.waste_type;
      if (!initialGrouped[date].wasteTypes[wasteType]) initialGrouped[date].wasteTypes[wasteType] = 0;
      initialGrouped[date].wasteTypes[wasteType] += item.measurement.weight;
    });
    return initialGrouped;
  }, [measurementsData]);

  useEffect(() => setGroupedData(initialGroupedData), [initialGroupedData]);

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        const data = await fetchMeasurementsByUserId(slug);
        setMeasurementsData(data);
      } catch (error) {
        console.error("Failed to fetch measurements:", error);
      }
    };

    const fetchUser = async () => {
      try {
        const data = await fetchWastePickerById(slug);
        setUserData(data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    const fetchData = async () => {
      fetchMeasurements();
      fetchUser();
      setLoading(false);
    }

    fetchData();
  }, []);


  // Group measurements by date
  useEffect(() => {
    const grouped = measurementsData.reduce((acc, item) => {
      const date = new Date(item.measurement.timestamp * 1000).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = {totalWaste: 0, totalPrice: 0, wasteTypes: {}};
      acc[date].totalWaste += item.measurement.weight;
      acc[date].totalPrice += item.total_price;

      const wasteType = item.measurement.waste_type;
      if (!acc[date].wasteTypes[wasteType]) acc[date].wasteTypes[wasteType] = 0;
      acc[date].wasteTypes[wasteType] += item.measurement.weight;

      return acc;
    }, {});
    setGroupedData(grouped);
  }, []);

  return (
    <div>
      {loading ?
        (<p className={styles.loading}>Carregando...</p>) :
        (
          <>
            {userData && measurementsData ? (
              <div className={styles.container}>
                <div className={styles.leftColumn}>
                  <div>
                    <h1>{userData.name}</h1>
                    <p>email: {userData.email}</p>
                  </div>

                  <div>
                    <h2>Medidas</h2>
                    <div>
                      {Object.entries(groupedData)
                        .sort(([dateA]: [string, typeof groupedData[string]], [dateB]: [string, typeof groupedData[string]]) => (dateA < dateB ? 1 : -1))
                        .map(([date, {totalWaste, totalPrice, wasteTypes}]) => (
                          <div key={date} className={styles.card}>
                            <h3>{new Date(date).toLocaleDateString("pt-BR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}</h3>
                            <p>Total de resíduos coletados: {totalWaste.toFixed(2)} kg</p>
                            <p>Preço total: R${totalPrice.toFixed(2)}</p>
                            <h4>Tipos de resíduos:</h4>
                            <ul>
                              {Object.entries(wasteTypes).map(([type, weight]) => (
                                <li key={type}>
                                  {type}: {weight.toFixed(2)} kg
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className={styles.rightColumn}>
                  <h2>Ganhos mensais</h2>
                  <label htmlFor="month-selector">Selecione o mês: </label>
                  <select
                    id="month-selector"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {[...new Set(Object.keys(groupedData).map((date) => date.slice(0, 7)))]
                      .sort((a, b) => {
                        const [yearA, monthA] = a.split("-").map(Number);
                        const [yearB, monthB] = b.split("-").map(Number);
                        return yearA === yearB ? monthA - monthB : yearA - yearB;
                      })
                      .map((month) => {
                        const [year, monthIndex] = month.split("-");
                        const formattedMonth = new Date(+year, +monthIndex - 1).toLocaleDateString("pt-BR", {
                          month: "short",
                          year: "numeric",
                        });
                        return (
                          <option key={month} value={month}>
                            {formattedMonth}
                          </option>
                        );
                      })}
                  </select>


                  <div className={styles.chartContainer}>
                    <Bar
                      data={{
                        labels: Object.keys(groupedData)
                          .filter((date) => date.startsWith(selectedMonth))
                          .sort()
                          .map((date) => new Date(date).toLocaleDateString("pt-BR", {day: "numeric", month: "short"})),
                        datasets: [
                          {
                            label: "Earnings (R$)",
                            data: Object.keys(groupedData)
                              .filter((date) => date.startsWith(selectedMonth))
                              .sort()
                              .map((date) => groupedData[date]?.totalPrice || 0),
                            backgroundColor: "rgba(75, 192, 192, 0.6)",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {display: true},
                          title: {
                            display: true,
                            text: `Ganhos para ${new Date(selectedMonth).toLocaleDateString("pt-BR", {
                              month: "short",
                              year: "numeric"
                            })}`
                          },
                        },
                        scales: {
                          x: {title: {display: true, text: "Dias do mês"}},
                          y: {title: {display: true, text: "Ganhos (R$)"}},
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <h1>Nenhuma informação</h1>
            )}
          </>
        )}
    </div>
  )
}
