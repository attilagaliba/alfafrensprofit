/* eslint-disable react-hooks/exhaustive-deps */
// src/app/page.tsx
"use client";
import { useState, useEffect, SetStateAction } from "react";
import styled from "styled-components";
import Layout from "./layout";

import axios from "axios";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 15px;
  padding: 20px;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 2rem;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  margin-right: 1rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
`;

const Table = styled.table`
  border-collapse: collapse;
  width: 80%;
  margin: 1rem 0;
  text-align: center;
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: 10px;
`;

const Th = styled.th`
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 0.5rem 1rem;
  color: ${({ theme }) => theme.colors.accent};
`;

const Td = styled.td`
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 0.5rem 1rem;
`;

const Home = () => {
  const [X, setX] = useState<number>(0);
  const [Y, setY] = useState<number>(0);
  const [Z, setZ] = useState<number>(0);
  const [T, setT] = useState<number>(0);

  const [userAddress, setUserAddress] = useState("");

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddressChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setUserAddress(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      const url = "https://base-mainnet.subgraph.x.superfluid.dev/";
      const streamsQuery = `
        query streams($first: Int = 10, $orderBy: Stream_orderBy = id, $orderDirection: OrderDirection = asc, $skip: Int = 0, $where: Stream_filter = {}, $block: Block_height) {
          streams(
            orderBy: $orderBy
            orderDirection: $orderDirection
            first: $first
            skip: $skip
            where: $where
            block: $block
          ) {
            createdAtBlockNumber
            createdAtTimestamp
            currentFlowRate
            id
            receiver {
              id
            }
            sender {
              id
            }
            streamedUntilUpdatedAt
            token {
              id
              symbol
            }
            updatedAtBlockNumber
            updatedAtTimestamp
            deposit
            userData
          }
        }
      `;
      const variables = {
        where: { sender: userAddress },
        first: 1000,
      };

      const tokenBalanceHistoryQuery = `
      query tokenBalanceHistoryQuery($accountAddress: String, $tokenAddress: String, $timestamp_gte: BigInt, $timestamp_lte: BigInt) {
        accountTokenSnapshotLogs(
          where: {
            account: $accountAddress
            token: $tokenAddress
            timestamp_gte: $timestamp_gte
            timestamp_lte: $timestamp_lte
          }
          orderBy: order
          orderDirection: desc
          first: 1
        ) {
          balance
          totalNetFlowRate
          timestamp
        }
      }
    `;

      const tokenBalanceVariables = {
        accountAddress: userAddress,
        tokenAddress: "0x1eff3dd78f4a14abfa9fa66579bd3ce9e1b30529",
        timestamp_gte: "0",
        timestamp_lte: "1715934995",
      };

      try {
        const streamsQuery = `
        query streams($first: Int = 10, $orderBy: Stream_orderBy = id, $orderDirection: OrderDirection = asc, $skip: Int = 0, $where: Stream_filter = {}, $block: Block_height) {
          streams(
            orderBy: $orderBy
            orderDirection: $orderDirection
            first: $first
            skip: $skip
            where: $where
            block: $block
          ) {
            createdAtBlockNumber
            createdAtTimestamp
            currentFlowRate
            id
            receiver {
              id
            }
            sender {
              id
            }
            streamedUntilUpdatedAt
            token {
              id
              symbol
            }
            updatedAtBlockNumber
            updatedAtTimestamp
            deposit
            userData
          }
        }
      `;
        const [streamsResponse, balanceResponse] = await Promise.all([
          axios.post(url, {
            operationName: "streams",
            query: streamsQuery,
            variables: variables,
          }),
          axios.post(url, {
            operationName: "tokenBalanceHistoryQuery",
            query: tokenBalanceHistoryQuery,
            variables: tokenBalanceVariables,
          }),
        ]);

        const streams = streamsResponse.data.data.streams;
        // Filtreleme işlemi burada yapılıyor
        const filteredStreams = streams.filter(
          (stream: any) => stream.currentFlowRate !== "0"
        );

        const latestBalance =
          balanceResponse.data.data.accountTokenSnapshotLogs[0]?.balance || "0";

        setBalance(latestBalance);

        setData(filteredStreams);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = () => {
      fetch(
        "https://li.quest/v1/token?chain=8453&token=0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed"
      )
        .then((response) => response.json())
        .then((data) => {
          const priceUSD = parseFloat(data.priceUSD);
          setT(priceUSD);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    };

    // İlk olarak bir kere çağrıyoruz
    fetchData();

    // Sonra saniyede bir çağırıyoruz
    const intervalId = setInterval(fetchData, 1000);

    // Komponent unmount olduğunda clearInterval çağırarak interval'i temizliyoruz
    return () => clearInterval(intervalId);
  }, []);

  const dailyAlphaEarned = X * 5.2;
  const dailyAboneEarnings = Y * 4.16;
  const dailyStakeEarnings = Z * 0.325;

  const totalDailyDegenEarnings = dailyAboneEarnings + dailyStakeEarnings;
  const totalDailyDegenEarningsInDollars = totalDailyDegenEarnings * T;

  const dailySubscriptionCost = X * 17.66;
  const dailySubscriptionCostInDollars = dailySubscriptionCost * T;

  const netDailyDegenProfit = totalDailyDegenEarnings - dailySubscriptionCost;
  const netDailyDegenProfitInDollars = netDailyDegenProfit * T;

  const getTotalFlowRate = (streams: any[]) => {
    let totalFlowRate = 0;

    streams.forEach((stream: { currentFlowRate: string }) => {
      totalFlowRate += parseFloat(stream.currentFlowRate);
    });

    return totalFlowRate;
  };
  const fetchDataForAddress = async () => {
    try {
      const streamsQuery = `
      query streams($first: Int = 10, $orderBy: Stream_orderBy = id, $orderDirection: OrderDirection = asc, $skip: Int = 0, $where: Stream_filter = {}, $block: Block_height) {
        streams(
          orderBy: $orderBy
          orderDirection: $orderDirection
          first: $first
          skip: $skip
          where: $where
          block: $block
        ) {
          createdAtBlockNumber
          createdAtTimestamp
          currentFlowRate
          id
          receiver {
            id
          }
          sender {
            id
          }
          streamedUntilUpdatedAt
          token {
            id
            symbol
          }
          updatedAtBlockNumber
          updatedAtTimestamp
          deposit
          userData
        }
      }
    `;
      const url = "https://base-mainnet.subgraph.x.superfluid.dev/";
      const response = await axios.post(url, {
        operationName: "streams",
        query: streamsQuery,
        variables: {
          where: { sender: userAddress },
          first: 1000,
        },
      });

      const streams = response.data.data.streams;

      const filteredStreams = streams.filter(
        (stream: any) => stream.currentFlowRate !== "0"
      );
      setX(
        parseFloat((getTotalFlowRate(data) / 380517503805.174).toFixed(0)) / 500
      );

      setData(filteredStreams);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  return (
    <Layout>
      <Container>
        <Title>Degen Profit Calculator</Title>
        <InputContainer>
          <Label>Profile Address:</Label>
          <Input
            type="text"
            value={userAddress}
            onChange={handleAddressChange}
          />
          {/* Buton, tıklandığında fetchDataForAddress fonksiyonunu çağırır */}
          <button
            style={{
              backgroundColor: "#6a5acd", // Koyu mor
              color: "white",
              border: "none",
              borderRadius: "10px", // Yuvarlak köşeler
              padding: "10px 20px",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#483d8b")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#6a5acd")
            }
            onClick={fetchDataForAddress}
          >
            Get Profile Data
          </button>
        </InputContainer>
        <p aria-setsize={10}>https://www.alfafrens.com/profile/-YourAddress-</p>
        <InputContainer>
          <Label>Your Sub.. (/500):</Label>
          <Input
            type="number"
            value={X}
            onChange={(e) => setX(parseFloat(e.target.value))}
            disabled
            style={{ backgroundColor: "gray" }}
          />
        </InputContainer>
        <InputContainer>
          <Label>Your Channel Subs:</Label>
          <Input
            type="number"
            value={Y}
            onChange={(e) => setY(parseFloat(e.target.value))}
          />
        </InputContainer>
        <InputContainer>
          <Label>Total Alfa Stakes:</Label>
          <Input
            type="number"
            value={Z}
            onChange={(e) => setZ(parseFloat(e.target.value))}
          />
        </InputContainer>
        Degen Price: {T}
        <br /> <br />
        <div>Total Subscriptions: {data.length}</div>
        <div>
          Total Expenses:{" "}
          {(getTotalFlowRate(data) / 380517503805.174).toFixed(0)} /m
        </div>
        <div>Total Revenue: {(totalDailyDegenEarnings * 30).toFixed(0)} /m</div>
        <div>
          Total Expenses:{" "}
          {(
            parseFloat((getTotalFlowRate(data) / 380517503805.174).toFixed(0)) /
            30
          ).toFixed(2)}{" "}
          /d
        </div>
        <h2>Gains</h2>
        <Table>
          <thead>
            <tr>
              <Th>Category</Th>
              <Th>Formula</Th>
              <Th>Amount /d</Th>
              <Th>Amount /m</Th>
              <Th>Unit</Th>
              <Th>Dollar Eq. /d</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>Daily Alfa Earned</Td>
              <Td>{`(${X} * 5.33) avr.160`}</Td>
              <Td>{dailyAlphaEarned.toFixed(2)}</Td>
              <Td>{(dailyAlphaEarned * 30).toFixed(2)}</Td>

              <Td>Alfa</Td>
              <Td>-</Td>
            </tr>
            <tr>
              <Td>Daily Subscriber Earnings</Td>
              <Td>{`${Y} * 4.16`}</Td>
              <Td>{(dailyAboneEarnings * 30).toFixed(0)}</Td>
              <Td>{dailyAboneEarnings.toFixed(0)}</Td>
              <Td>Degen</Td>
              <Td>{(dailyAboneEarnings * T).toFixed(2)}$</Td>
            </tr>

            <tr>
              <Td>Daily Alfa Stake Earnings</Td>
              <Td>{`avrg. (${Z} * 0.34)`}</Td>
              <Td>{dailyStakeEarnings.toFixed(2)}</Td>
              <Td>{(dailyStakeEarnings * 30).toFixed(2)}</Td>
              <Td>Degen</Td>
              <Td>{(dailyStakeEarnings * T).toFixed(2)}$</Td>
            </tr>
            <tr>
              <Td>
                <strong>Total Daily Earnings</strong>
              </Td>
              <Td>-</Td>
              <Td>
                <strong>{totalDailyDegenEarnings.toFixed(0)}</strong>
              </Td>
              <Td>
                <strong>{(totalDailyDegenEarnings * 30).toFixed(0)}</strong>
              </Td>
              <Td>
                <strong>Degen</strong>
              </Td>
              <Td>
                <strong>{totalDailyDegenEarningsInDollars.toFixed(2)}$</strong>
              </Td>
            </tr>
          </tbody>
        </Table>
        <h2>Daily Expenses</h2>
        <Table>
          <thead>
            <tr>
              <Th>Category</Th>
              <Th>Formula</Th>
              <Th>Amount</Th>
              <Th>Unit</Th>
              <Th>Dollar Equivalent</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>Daily Subscription Cost</Td>
              <Td>{`(${X} * 16.66)`}</Td>
              <Td>{dailySubscriptionCost.toFixed(2)}</Td>
              <Td>Degen</Td>
              <Td>{dailySubscriptionCostInDollars.toFixed(2)}$</Td>
            </tr>
          </tbody>
        </Table>
        <h2>Daily Net Profit</h2>
        <Table>
          <thead>
            <tr>
              <Th>Category</Th>
              <Th>Formula</Th>
              <Th>Amount</Th>
              <Th>Unit</Th>
              <Th>Dollar Equivalent</Th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Td>Total Earnings</Td>
              <Td>-</Td>
              <Td>{totalDailyDegenEarnings.toFixed(2)}</Td>
              <Td>Degen</Td>
              <Td>{totalDailyDegenEarningsInDollars.toFixed(2)}$</Td>
            </tr>
            <tr>
              <Td>Total Expenses</Td>
              <Td>-</Td>
              <Td>{dailySubscriptionCost.toFixed(2)}</Td>
              <Td>Degen</Td>
              <Td>{dailySubscriptionCostInDollars.toFixed(2)}$</Td>
            </tr>
            <tr>
              <Td>
                <strong>Net Daily Profit</strong>
              </Td>
              <Td>-</Td>
              <Td>
                <strong>{netDailyDegenProfit.toFixed(2)}</strong>
              </Td>
              <Td>
                <strong>Degen</strong>
              </Td>
              <Td>
                <strong>{netDailyDegenProfitInDollars.toFixed(2)}$</strong>
              </Td>
            </tr>
          </tbody>
        </Table>
        <a
          style={{ color: "white" }}
          target="_blank"
          href="https://www.alfafrens.com/channel/0x27bf87dcaf7121715ac6b8addf2085a62be7ea0d"
        >
          @attilagaliba
        </a>
      </Container>
    </Layout>
  );
};

export default Home;
