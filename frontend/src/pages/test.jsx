import React, { useState, useEffect } from "react";

const Test = () => {
    const [users, setUsers] = useState([]);
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const usersResponse = await fetch("http://localhost:8081/users");
                const assetsResponse = await fetch("http://localhost:8081/assets");

                if (!usersResponse.ok || !assetsResponse.ok) {
                    throw new Error("Failed to fetch data from the server.");
                }

                const usersData = await usersResponse.json();
                const assetsData = await assetsResponse.json();

                setUsers(usersData);
                setAssets(assetsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <p>Loading data...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h1>Test Page</h1>

            <h2>Users Table</h2>
            <table border="1" cellPadding="5">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{new Date(user.created_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Assets Table</h2>
            <table border="1" cellPadding="5">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {assets.map(asset => (
                        <tr key={asset.id}>
                            <td>{asset.id}</td>
                            <td>{asset.name}</td>
                            <td>{asset.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Test;
