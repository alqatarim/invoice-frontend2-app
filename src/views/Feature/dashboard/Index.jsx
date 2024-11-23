import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import ApexCharts from "apexcharts";
import { ApiServiceContext } from "../../../core/API/api-service";
import { commonDatacontext } from "../../../core/commonData";
import {
  amountFormat,
  convertFirstLetterToCapital,
  toTitleCase,
} from "../../../common/helper";
import nodata from "../../../assets/img/nodata.png";
import { successToast } from "../../../core/core-index";
import moment from "moment";
import FeatherIcon from "feather-icons-react";
import { PreviewImg } from "../../../common/imagepath";

const Dashboard = () => {
  const { getData, postData } = useContext(ApiServiceContext);
  const { currencyData } = useContext(commonDatacontext);
  const [dashboardData, setDashboardData] = useState([]);
  const [filterValue, setfilterValue] = useState("month");
  const [invoiceData, setinvoiceData] = useState([]);
  const [RowId, setRowId] = useState("");
  const invoiceOptions = {
    colors: ["#33B469", "#ffc107", "#ff737b", "#2196f3"],
    chart: {
      fontFamily: "Poppins, sans-serif",
      height: 350,
      type: "donut",
    },
    legend: { show: false },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const getDetials = async (filter = "") => {
    if (filterValue != filter) setfilterValue(filter);
    try {
      const response = await getData(`/dashboard?type=${filter}`);
      if (response.code === 200) {
        setDashboardData(response.data);
        setinvoiceData(response.data?.invoiceList);
        invoiceOptions.labels = response?.data?.labels;
        invoiceOptions.series = response?.data?.series;
        let invoiceColumn = document.getElementById("invoice_chart");
        let IsemtyChartdata = invoiceOptions.series?.every((dt) => {
          return dt == 0;
        });
        invoiceColumn.innerHTML = "";
        if (IsemtyChartdata) {
          invoiceColumn.innerHTML = `<img id="noDataimg" src=${nodata} height="380px;" alt=''/>`;
        } else {
          let invoiceChart = new ApexCharts(invoiceColumn, invoiceOptions);
          invoiceChart.render();
        }
      }
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    let invoiceChart;
    const fetchDetials = async () => {
      try {
        const response = await getData(`/dashboard`);
        if (response.code === 200) {
          setDashboardData(response.data);
          setinvoiceData(response.data?.invoiceList);
          invoiceOptions.labels = response?.data?.labels;
          invoiceOptions.series = response?.data?.series;
          let invoiceColumn = document.getElementById("invoice_chart");
          let IsemtyChartdata = invoiceOptions.series?.every((dt) => {
            return dt == 0;
          });
          invoiceColumn.innerHTML = "";
          if (IsemtyChartdata) {
            invoiceColumn.innerHTML = `<img id="noDataimg" src=${nodata} height="380px;" alt=''/>`;
          } else {
            invoiceChart = new ApexCharts(invoiceColumn, invoiceOptions);
            invoiceChart.render();
          }
        }
      } catch (error) {
        return false;
      }
    };
    fetchDetials();
    //getInvoiceDetials();
    return () => {
      if (invoiceChart) {
        invoiceChart.destroy();
      }
    };
  }, []);

  const convertTosalesReturn = async (id) => {
    try {
      const response = await postData(`/invoice/${id}/convertsalesreturn`, {});
      if (response.code === 200) {
        successToast("Invoice converted to sales return.");
      }
      return response;
    } catch (error) {
      return false;
    }
  };

  const send = async (id) => {
    try {
      const response = await getData(`/invoice/pdfCreate?invoiceId=${id}`);
      if (response.code === 200) {
        successToast("Invoice Mail sent Success");
      }
      return response;
    } catch (error) {
      return false;
    }
  };

  const clone = async (id) => {
    try {
      const response = await postData(`/invoice/${id}/clone`, {});
      if (response.code === 200) {
        successToast("Invoice Cloned Successfully");
        let sortedArray = await sortbyINVnumberDESC([
          ...invoiceData,
          response.data,
        ]);
        setinvoiceData(sortedArray);
        return response;
      }
    } catch (error) {
      return false;
    }
  };
  return (
    <>
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="row">
            <div className="col-xl-3 col-sm-6 col-12">
              <div className="card">
                <div className="card-body">
                  <div className="dash-widget-header">
                    <span className="dash-widget-icon bg-1">
                      <i className="fas fa-dollar-sign"></i>
                    </span>
                    <div className="dash-count">
                      <div className="dash-title">Amount Due</div>
                      <div className="dash-counts">
                        <p>
                          {currencyData ? currencyData : "$"}

                          {amountFormat(
                            dashboardData?.overdueAmt +
                              dashboardData?.draftedAmt
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="progress progress-sm mt-3">
                    <div
                      className="progress-bar bg-5"
                      role="progressbar"
                      style={{ width: `${dashboardData?.pending}%` }}
                      aria-valuenow={dashboardData?.pending}
                      aria-valuemin="0"
                      aria-valuemax="100000"
                    ></div>
                  </div>
                  <p className="text-muted mt-3 mb-0 dashbord-data">
                    <span
                      className={`me-1 ${
                        dashboardData?.amountDuePercentage?.percentage ==
                        "Increased"
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {dashboardData?.amountDuePercentage?.percentage ==
                      "Increased" ? (
                        <i className="fas fa-arrow-up me-1"></i>
                      ) : (
                        <i className="fas fa-arrow-down me-1"></i>
                      )}
                      {dashboardData?.amountDuePercentage?.value}
                    </span>
                    since last week
                  </p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12">
              <div className="card">
                <div className="card-body">
                  <div className="dash-widget-header">
                    <span className="dash-widget-icon bg-2">
                      <i className="fas fa-users"></i>
                    </span>
                    <div className="dash-count">
                      <div className="dash-title">Customers</div>
                      <div className="dash-counts">
                        <p>{dashboardData?.customers}</p>
                      </div>
                    </div>
                  </div>
                  <div className="progress progress-sm mt-3">
                    <div
                      className="progress-bar bg-6"
                      role="progressbar"
                      style={{ width: `${dashboardData?.customers}%` }}
                      aria-valuenow={dashboardData?.customers}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <p className="text-muted mt-3 mb-0 dashbord-data">
                    <span
                      className={`me-1 ${
                        dashboardData?.customerPercentage?.percentage ==
                        "Increased"
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {dashboardData?.customerPercentage?.percentage ==
                      "Increased" ? (
                        <i className="fas fa-arrow-up me-1"></i>
                      ) : (
                        <i className="fas fa-arrow-down me-1"></i>
                      )}
                      {dashboardData?.customerPercentage?.value}
                    </span>
                    since last week
                  </p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12">
              <div className="card">
                <div className="card-body">
                  <div className="dash-widget-header">
                    <span className="dash-widget-icon bg-3">
                      <i className="fas fa-file-alt"></i>
                    </span>
                    <div className="dash-count">
                      <div className="dash-title">Invoices</div>
                      <div className="dash-counts">
                        <p>
                          {currencyData ? currencyData : "$"}
                          {amountFormat(dashboardData?.invoiced)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="progress progress-sm mt-3">
                    <div
                      className="progress-bar bg-7"
                      role="progressbar"
                      style={{ width: `${dashboardData?.invoiced}%` }}
                      aria-valuenow={dashboardData?.invoiced}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <p className="text-muted mt-3 mb-0 dashbord-data">
                    <span
                      className={`me-1 ${
                        dashboardData?.invoicedPercentage?.percentage ==
                        "Increased"
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {dashboardData?.invoicedPercentage?.percentage ==
                      "Increased" ? (
                        <i className="fas fa-arrow-up me-1"></i>
                      ) : (
                        <i className="fas fa-arrow-down me-1"></i>
                      )}
                      {dashboardData?.invoicedPercentage?.value}
                    </span>
                    since last week
                  </p>
                </div>
              </div>
            </div>
            <div className="col-xl-3 col-sm-6 col-12">
              <div className="card">
                <div className="card-body">
                  <div className="dash-widget-header">
                    <span className="dash-widget-icon bg-4">
                      <i className="far fa-file"></i>
                    </span>
                    <div className="dash-count">
                      <div className="dash-title">Estimates</div>
                      <div className="dash-counts">
                        <p>{dashboardData?.estimates}</p>
                      </div>
                    </div>
                  </div>
                  <div className="progress progress-sm mt-3">
                    <div
                      className="progress-bar bg-8"
                      role="progressbar"
                      style={{ width: `${dashboardData?.estimates}%` }}
                      aria-valuenow={dashboardData?.estimates}
                      aria-valuemin="0"
                      aria-valuemax="100000"
                    ></div>
                  </div>
                  <p className="text-muted mt-3 mb-0 dashbord-data">
                    <span
                      className={`me-1 ${
                        dashboardData?.quotationPercentage?.percentage ==
                        "Increased"
                          ? "text-success"
                          : "text-danger"
                      }`}
                    >
                      {dashboardData?.quotationPercentage?.percentage ==
                      "Increased" ? (
                        <i className="fas fa-arrow-up me-1"></i>
                      ) : (
                        <i className="fas fa-arrow-down me-1"></i>
                      )}
                      {dashboardData?.quotationPercentage?.value}
                    </span>
                    since last week
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-xl-7 d-flex">
              <div className="card">
                <div className="card-header">
                  <div className="row">
                    <div className="col">
                      <h5 className="card-title">Recent Invoices</h5>
                    </div>
                    <div className="col-auto">
                      <Link
                        to="/invoice-list"
                        className="btn-right btn btn-sm btn-outline-primary"
                      >
                        View All
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="progress progress-md rounded-pill mb-3">
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: "47%" }}
                        aria-valuenow="47"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                      <div
                        className="progress-bar bg-warning"
                        role="progressbar"
                        style={{ width: "28%" }}
                        aria-valuenow="28"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                      <div
                        className="progress-bar bg-danger"
                        role="progressbar"
                        style={{ width: "15%" }}
                        aria-valuenow="15"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                      <div
                        className="progress-bar bg-info"
                        role="progressbar"
                        style={{ width: "10%" }}
                        aria-valuenow="10"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <div className="row">
                      <div className="col-auto">
                        <i className="fas fa-circle text-success me-1"></i> Paid
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-circle text-info me-1"></i>{" "}
                        Partially Paid
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-circle text-danger me-1"></i>{" "}
                        Overdue
                      </div>
                      <div className="col-auto">
                        <i className="fas fa-circle text-warning me-1"></i>{" "}
                        Draft
                      </div>
                    </div>
                  </div>

                  <div className="table-responsive dashboard">
                    <table className="table table-stripped table-hover">
                      <thead className="thead-light">
                        <tr>
                          <th>Customer</th>
                          <th>Amount</th>
                          <th>Due Date</th>
                          <th>Status</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.map((item, index) => {
                          let status;

                          {
                            item.status === "REFUND" &&
                              (status = (
                                <span className="badge bg-info-lights">
                                  {convertFirstLetterToCapital(item.status)}
                                </span>
                              ));
                          }
                          {
                            item.status === "SENT" &&
                              (status = (
                                <span className="badge bg-info-lights">
                                  {convertFirstLetterToCapital(item.status)}
                                </span>
                              ));
                          }
                          {
                            item.status === "UNPAID" &&
                              (status = (
                                <span className="badge bg-light-gray item.status-secondary">
                                  {convertFirstLetterToCapital(item.status)}
                                </span>
                              ));
                          }
                          {
                            item.status === "PARTIALLY_PAID" &&
                              (status = (
                                <span className="badge bg-primary-light">
                                  {/* {item.status } */}
                                  PARTIALLY PAID
                                </span>
                              ));
                          }
                          {
                            item.status === "CANCELLED" &&
                              (status = (
                                <span className="badge bg-danger-light">
                                  {convertFirstLetterToCapital(item.status)}
                                </span>
                              ));
                          }
                          {
                            item.status === "OVERDUE" &&
                              (status = (
                                <span className="badge bg-danger-light">
                                  {convertFirstLetterToCapital(item.status)}
                                </span>
                              ));
                          }
                          {
                            item.status === "PAID" &&
                              (status = (
                                <span className="badge bg-success-light">
                                  {convertFirstLetterToCapital(item.status)}
                                </span>
                              ));
                          }
                          {
                            item.status === "DRAFTED" &&
                              (status = (
                                <span className="badge bg-warning">
                                  {convertFirstLetterToCapital(item.status)}
                                </span>
                              ));
                          }

                          return (
                            <tr key={index}>
                              <td>
                                <h2 className="table-avatar">
                                  <Link to={{ pathname: `${"/view-customer"}/${item?.customerId?._id}` }}>
                                    <img
                                      className="aavatar avatar-sm me-2 avatar-img rounded-circle"
                                      src={
                                        item.customerId?.image
                                          ? item.customerId?.image
                                          : PreviewImg
                                      }
                                      alt="User Image"
                                    />

                                    {item.customerId?.name
                                      ? item.customerId?.name
                                      : `Deleted Customer`}
                                  </Link>
                                </h2>
                              </td>
                              <td>

                                {currencyData ? currencyData : "$"}
                                {Number(item.TotalAmount).toLocaleString(
                                  "en-IN",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}
                              </td>
                              <td>
                                {moment(item.dueDate).format("DD-MM-YYYY")}
                              </td>
                              <td>{status}</td>
                              <td className="text-center">
                                <div className="d-flex align-items-center customer-details">
                                  <div className="dropdown dropdown-action">
                                    <Link
                                      to="#"
                                      className="btn-action-icon"
                                      data-bs-toggle="dropdown"
                                      aria-expanded="false"
                                    >
                                      <i className="fas fa-ellipsis-v" />
                                    </Link>
                                    <div className="dropdown-menu dropdown-menu-end quatation-dropdown">
                                      <Link
                                        className="dropdown-item"
                                        to={{
                                          pathname: `${"/edit-invoice"}/${
                                            item._id
                                          }`,
                                        }}
                                      >
                                        <i className="far fa-edit me-2" />
                                        Edit
                                      </Link>

                                      <Link
                                        target="_blank"
                                        className="dropdown-item"
                                        to={{
                                          pathname: `${"/view-invoice"}/${
                                            item._id
                                          }`,
                                        }}
                                      >
                                        <i className="far fa-eye me-2" />
                                        View
                                      </Link>

                                      <Link
                                        className="dropdown-item"
                                        to="#"
                                        onClick={() => setRowId(item?._id)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#send_modal"
                                      >
                                        <FeatherIcon
                                          icon="send"
                                          className="me-2"
                                        />
                                        Send
                                      </Link>



                                      <Link
                                        className="dropdown-item"
                                        onClick={() => setRowId(item?._id)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#clone_modal"
                                        to="/#"
                                      >

                                        <FeatherIcon
                                          icon="copy"
                                          className="me-2"
                                        />
                                        Clone as Invoice
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-5 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title">Invoice Analytics</h5>
                    <div
                      className="dropdown chart-dropdown"
                      data-bs-toggle="dropdown"
                    >
                      <Link
                        to="#"
                        className="btn btn-white btn-sm dropdown-toggle"
                        role="button"
                        data-bs-toggle="dropdown"
                      >
                        {toTitleCase(filterValue)}ly
                      </Link>
                      <div className="dropdown-menu dropdown-menu-right">
                        <Link
                          to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            getDetials("week");
                          }}
                          className="dropdown-item"
                        >
                          Weekly
                        </Link>
                        <Link
                          to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            getDetials("month");
                          }}
                          className="dropdown-item"
                        >
                          Monthly
                        </Link>
                        <Link
                          to="#"
                          onClick={(e) => {
                            e.preventDefault();
                            getDetials("year");
                          }}
                          className="dropdown-item"
                        >
                          Yearly
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  <div id="invoice_chart"></div>
                  <div className=" text-muted">
                    <div className="row">
                      <div className="col-6">
                        <div className="mt-4 ps-5">
                          <p className="mb-2 text-truncate">
                            <i className="fas fa-circle text-success me-1"></i>
                            Paid
                          </p>
                          <h5>
                            {currencyData ? currencyData : "$"}
                            {amountFormat(dashboardData?.paidAmt)}
                          </h5>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="mt-4 ps-5">
                          <p className="mb-2 text-truncate">
                            <i className="fas fa-circle text-warning me-1"></i>{" "}
                            Drafted
                          </p>
                          <h5>
                            {currencyData ? currencyData : "$"}
                            {amountFormat(dashboardData?.draftedAmt)}
                          </h5>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="mt-4 ps-5">
                          <p className="mb-2 text-truncate">
                            <i className="fas fa-circle text-primary me-1"></i>{" "}
                            Partially Paid
                          </p>
                          <h5>
                            {currencyData ? currencyData : "$"}
                            {amountFormat(dashboardData?.partiallyPaidAmt)}
                          </h5>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="mt-4 ps-5">
                          <p className="mb-2 text-truncate danger-dot">
                            <i className="fas fa-circle text-danger-light me-1"></i>{" "}
                            Overdue
                          </p>
                          <h5>
                            {currencyData ? currencyData : "$"}
                            {amountFormat(dashboardData?.overdueAmt)}
                          </h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal custom-modal fade" id="delete_modal" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Delete Invoice</h3>
                <p>Are you sure want to delete?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <button
                      type="reset"
                      data-bs-dismiss="modal"
                      className="w-100 btn btn-primary paid-continue-btn"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      type="submit"
                      data-bs-dismiss="modal"
                      className="w-100 btn btn-primary paid-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal custom-modal fade" id="send_modal" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Send Invoice</h3>
                <p>Are you sure want to send Invoice ?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <button
                      type="reset"
                      onClick={() => send(RowId)}
                      data-bs-dismiss="modal"
                      className="w-100 btn btn-primary paid-continue-btn"
                    >
                      Send
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      data-bs-dismiss="modal"
                      className="w-100 btn btn-primary paid-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal custom-modal fade" id="convert_modal" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Convert to Sales Return</h3>
                <p>Are you sure want to Convert ?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <button
                      type="reset"
                      onClick={() => convertTosalesReturn(RowId)}
                      data-bs-dismiss="modal"
                      className="w-100 btn btn-primary paid-continue-btn"
                    >
                      Convert
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      data-bs-dismiss="modal"
                      className="w-100 btn btn-primary paid-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal custom-modal fade" id="clone_modal" role="dialog">
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content">
            <div className="modal-body">
              <div className="form-header">
                <h3>Clone Invoice</h3>
                <p>Are you sure want to clone this ?</p>
              </div>
              <div className="modal-btn delete-action">
                <div className="row">
                  <div className="col-6">
                    <button
                      type="reset"
                      onClick={() => clone(RowId)}
                      data-bs-dismiss="modal"
                      className="w-100 btn btn-primary paid-continue-btn"
                    >
                      Clone
                    </button>
                  </div>
                  <div className="col-6">
                    <button
                      data-bs-dismiss="modal"
                      className="w-100 btn btn-primary paid-cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Dashboard;
