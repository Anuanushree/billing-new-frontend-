import React, { useState } from "react";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Container,
} from "@mui/material";
import Dashboard from "../dashboard/Dashboard";

function Calc() {
  const amounts = [2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
  const [values, setValues] = useState(
    amounts.reduce((acc, amount) => {
      acc[amount] = 0;
      return acc;
    }, {})
  );

  const handleChange = (amount, newValue) => {
    if (!isNaN(newValue) && newValue >= 0) {
      setValues({
        ...values,
        [amount]: parseInt(newValue),
      });
    } else {
      setValues({
        ...values,
        [amount]: 0,
      });
    }
  };

  const handleReset = () => {
    setValues(
      amounts.reduce((acc, amount) => {
        acc[amount] = 0;
        return acc;
      }, {})
    );
  };

  const calculateTotal = () => {
    return amounts.reduce((total, amount) => {
      return total + amount * values[amount];
    }, 0);
  };

  return (
    <div id="wrapper">
      {/* <Dashboard /> */}
      <Container>
        <Typography variant="h4" gutterBottom>
          Calc
        </Typography>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Amount</TableCell>
              <TableCell align="center">Quantity</TableCell>
              <TableCell align="center">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {amounts.map((amount) => (
              <TableRow key={amount}>
                <TableCell>{amount}</TableCell>
                <TableCell align="center">
                  <input
                    type="number"
                    value={values[amount]}
                    onChange={(e) => handleChange(amount, e.target.value)}
                  />
                </TableCell>
                <TableCell align="center">{amount * values[amount]}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2} align="right">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </TableCell>
              <TableCell align="center">
                <strong>Total {calculateTotal()}</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Container>
    </div>
  );
}

export default Calc;
