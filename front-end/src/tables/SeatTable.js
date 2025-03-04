import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  listTables,
  readReservation,
  updateTableAssignment,
} from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function SeatTable() {
  const { reservation_id } = useParams();

  const history = useHistory();

  const [tableId, setTableId] = useState("");

  const [tables, setTables] = useState([]);

  const [reservationSize, setReservationSize] = useState(null);

  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(loadSeatTable, [reservation_id]);

  function loadSeatTable() {
    const abortController = new AbortController();
    listTables(abortController.signal).then(setTables);
    readReservation(reservation_id, abortController.signal).then((res) =>
      setReservationSize(res.people)
    );
    return () => abortController.abort();
  }

  const tableOptions = tables.map((table) => (
    <option value={table.table_id} key={table.table_id}>
      {table.table_name} - {table.capacity}
    </option>
  ));

  const partyNotLargerThanTableCapacity = (tableId) => {
    if (reservationSize > parseInt(tableId)) return false;
    return true;
  };

  const validateForm = () => {
    const errorArr = [];

    if (!partyNotLargerThanTableCapacity(tableId)) {
      errorArr.push({
        message: "Party size is too large for this table",
      });
    }

    return errorArr;
  };

  const handleTableChange = ({ target }) => {
    setTableId(target.value);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    const errors = validateForm();

    setErrorMessages(errors);

    if (errors.length === 0) {
      const data = { reservation_id };

      updateTableAssignment(tableId, data)
        .then(() => history.push("/dashboard"))
        .catch((err) => console.log(err));
    }
  };

  const handleCancelButton = () => {
    history.goBack();
  };

  return (
    <div>
      {errorMessages.map((error, index) => (
        <ErrorAlert key={index} error={error} />
      ))}
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="table_id">
          <select
            name="table_id"
            id="table_id"
            onChange={handleTableChange}
            value={tableId}
          >
            <option value="">Select a table</option>
            {tableOptions}
          </select>
        </label>
        <div className="controls">
          <button type="submit">Submit</button>
          <button type="button" onClick={handleCancelButton}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default SeatTable;
