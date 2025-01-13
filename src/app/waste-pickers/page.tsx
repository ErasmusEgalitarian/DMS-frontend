"use client";

import React, {useState, useEffect} from "react";
import Link from "next/link";
import styles from "./styles.module.css";
import {fetchWastePickers} from "@/lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUsers = () => {

      try {
        fetchWastePickers().then((data) => {
          setUsers(data);
          setLoading(false);
        });

      } catch (error) {
        console.error("Failed to fetch users:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Lista de Catadores de Lixo</h1>
      {loading ? (
        <p className={styles.loading}>Carregando...</p>
      ) : (
        <ul className={styles.userList}>
          {users.map((user) => (
            <li key={user.id} className={styles.userItem}>
              <Link href={`/waste-pickers/${user.id}`} className={styles.userLink}>
                <strong>{user.name}</strong> - {user.email}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UsersPage;
