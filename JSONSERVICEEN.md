# JSON Service API Documentation

## Base Configuration

| Parameter | Description |
|-----------|-------------|
| `Service_Address` | Base URL of the service |
| `Key_Hack` | API authentication key |
| `User_Name` | Username provided to you |
| `User_Pass` | Password provided to you |

---

## 1. Location Inquiry Service

**Endpoint:** `JsonLocations.aspx`

### Request Parameters

| Parameter | Description |
|-----------|-------------|
| `Key_Hack` | `[Key_Hack_Value]` |

### Example URL

```
http://[Service_Address]/JsonLocations.aspx?Key_Hack=[Key_Hack_Value]
```

### Return Values

| Field | Description |
|-------|-------------|
| `Location_ID` | Location ID |
| `Location_Name` | Location Name |
| `Address` | Location Address |
| `Mail_Address` | Location Mail Address |
| `Telephone` | Location Telephone |
| `Delivery_Type` | Location Delivery Type |
| `Maps_Point` | Location Maps |
| `WorkDays` | Location Work Days |

---

## 2. Group Inquiry Service

**Endpoint:** `JsonGroup.aspx`

### Request Parameters

| Parameter | Description |
|-----------|-------------|
| `Key_Hack` | `[Key_Hack_Value]` |

### Example URL

```
http://[Service_Address]/JsonGroup.aspx?Key_Hack=[Key_Hack_Value]
```

### Return Values

| Field | Description |
|-------|-------------|
| `Group_ID` | Group ID |
| `Group_Name` | Group Name |
| `Driving_License_Age` | Driving License Age |
| `Driver_Age` | Driver Age |
| `SIPP` | SIPP Code |
| `Provision` | Provision |
| `Currency` | Currency |
| `Big_Bags` | Big Bags Capacity |
| `Small_Bags` | Small Bags Capacity |
| `Chairs` | Number of Seats |
| `Brand` | Brand |
| `Type` | Type |
| `Fuel` | Fuel Type |
| `Transmission` | Transmission |

---

## 3. Available Cars Inquiry Service

**Endpoint:** `JsonRez.aspx`

### Request Parameters

| Parameter | Description |
|-----------|-------------|
| `Key_Hack` | `[Key_Hack_Value]` |
| `User_Name` | User Name |
| `User_Pass` | User Pass |
| `Pickup_ID` | Pickup Location ID |
| `Drop_Off_ID` | Drop-off Location ID |
| `Pickup_Day` | Pickup Day |
| `Pickup_Month` | Pickup Month |
| `Pickup_Year` | Pickup Year |
| `Drop_Off_Day` | Drop-off Day |
| `Drop_Off_Month` | Drop-off Month |
| `Drop_Off_Year` | Drop-off Year |
| `Pickup_Hour` | Pickup Hour |
| `Pickup_Min` | Pickup Minute |
| `Drop_Off_Hour` | Drop-off Hour |
| `Drop_Off_Min` | Drop-off Minute |
| `Currency` | Currency Unit (TL, EURO, USD, GBP) |

### Example URL

```
http://[Service_Address]/JsonRez.aspx?Key_Hack=[Key_Hack_Value]&Drop_Off_ID=100&Pickup_ID=100&Pickup_Day=015&Pickup_Month=08&Pickup_Year=2023&Drop_Off_Day=023&Drop_Off_Month=08&Drop_Off_Year=2023&Pickup_Hour=15&Pickup_Min=00&Drop_Off_Hour=15&Drop_Off_Min=00&User_Name=example&User_Pass=example&Currency=TL
```

### Return Values

| Field | Description |
|-------|-------------|
| `Rez_ID` | Registration Number |
| `SIPP` | SIPP Codes |
| `Cars_Park_ID` | Car Park ID (sent as `Cars_Park_ID` in `XML_Rez_Save`) |
| `Group_ID` | Group ID (sent as `Group_ID` in `XML_Rez_Save`) |
| `Big_Bags` | Large Luggage Capacity |
| `Small_Bags` | Small Luggage Capacity |
| `Chairs` | Number of Seats |
| `Car_Name` | Car Group Name |
| `Driving_License_Age` | Driving License Year |
| `Driver_Age` | Driver Age |
| `Daily_Rental` | Daily Price |
| `Days` | Number of Rent Days |
| `Total_Rental` | Total Rental Price |
| `Provision` | Provision Fee (Deposit) |
| `Km_Limit` | Total KM Limit |
| `Drop` | Additional Drop Price |
| `Image_Path` | Car Image |
| `CDW` | CDW Total Price (`-1` = not for sale) |
| `SCDW` | SCDW Total Price (`-1` = not for sale) |
| `LCF` | LCF Total Price (`-1` = not for sale) |
| `PAI` | PAI Total Price (`-1` = not for sale) |
| `Baby_Seat` | Baby Seat Total Price (`-1` = not for sale) |
| `Navigation` | Navigation Total Price (`-1` = not for sale) |
| `Additional_Driver` | Additional Driver Total Price (`-1` = not for sale) |
| `LCF_Free` | `True` if LCF is Included |
| `SCDW_Free` | `True` if SCDW is Included |
| `CDW_Free` | `True` if CDW is Included |
| `PAI_Free` | `True` if PAI is Included |
| `Currency` | Currency |
| `Exchange` | Exchange Information |
| `Fuel` | Fuel Type |
| `Transmission` | Transmission |

---

## 4. Save Reservation Service

**Endpoint:** `JsonRez_Save.aspx`

### Request Parameters

| Parameter | Description |
|-----------|-------------|
| `Key_Hack` | `[Key_Hack_Value]` |
| `Pickup_ID` | Pickup Location Code |
| `Drop_Off_ID` | Drop-off Location Code |
| `Name` | Name of the Driver |
| `SurName` | Surname of the Driver |
| `MobilePhone` | Mobile Phone of the Driver |
| `Mail_Address` | Mail Address of the Driver |
| `Rental_ID` | Customer ID (or `Customer_ID` value) |
| `Cars_Park_ID` | Car Park ID |
| `Group_ID` | Rented Car Group (Will Be ID Number) |
| `User_Name` | Username provided to you |
| `User_Pass` | Password provided to you |
| `Rez_ID` | Reservation ID of the car |
| `Pickup_Day` | Pickup Day |
| `Pickup_Month` | Pickup Month |
| `Pickup_Year` | Pickup Year |
| `Drop_Off_Day` | Drop-off Day |
| `Drop_Off_Month` | Drop-off Month |
| `Drop_Off_Year` | Drop-off Year |
| `Pickup_Hour` | Pickup Hour |
| `Pickup_Min` | Pickup Minute |
| `Drop_Off_Hour` | Drop-off Hour |
| `Drop_Off_Min` | Drop-off Minute |
| `Adress` | Address of the Driver |
| `District` | District of the Driver |
| `City` | City of the Driver |
| `Country` | Country of the Driver |
| `Flight_Number` | Flight Number of the Driver |
| `Currency` | Currency Unit (TL, EURO, USD, GBP) |
| `Baby_Seat` | Is There a Baby Seat? `ON`/`OFF` |
| `Navigation` | Is There a Navigation? `ON`/`OFF` |
| `Additional_Driver` | Is There an Additional Driver? `ON`/`OFF` |
| `CDW` | Is There a CDW? `ON`/`OFF` |
| `SCDW` | Is There a SCDW? `ON`/`OFF` |
| `LCF` | Is There an LCF? `ON`/`OFF` |
| `Your_Rez_ID` | Your Reservation Number |
| `Your_Rent_Price` | Rental Fee You Pass on to the Customer |
| `Your_Extra_Price` | The Total of Extra Fees You Passed on to the Customer |
| `Your_Drop_Price` | The Drop Cost You Pass to the Customer |
| `Payment_Type` | See payment type options below |

### Payment Type Options

| Value | Description |
|-------|-------------|
| `0` | You Didn't Get Paid |
| `1` | You Receive Your Commission |
| `2` | You Received the Rent Payment (Paid Rent Amount, Amount Payable on Delivery, Extra + Drop) |
| `3` | You Received All Payment |

### Example URL

```
JsonRez_Save.aspx?Pickup_Day=15&Rental_ID=[Rental_ID]&Name=[Name]&Mail_Address=[Mail_Address]&Pickup_Hour=10&Drop_Off_Month=8&Pickup_Year=2023&Sur_Name=[Sur_Name]&Cars_Park_ID=[Cars_Park_ID]&Your_Rez_ID=[Your_ID]&Group_ID=155&Rez_ID=[Rez_ID]&Drop_Off_Min=0&MobilePhone=[MobilePhone]&Drop_Off_Day=23&Pickup_Month=8&Drop_Off_Year=2023&Pickup_Min=0&Pickup_ID=121&Currency=TL&Drop_Off_Hour=20&User_Pass=[User_Pass]&Drop_Off_ID=121&Key_Hack=[Key_Hack]&User_Name=[User_Name]
```

### Return Values

| Field | Description |
|-------|-------------|
| `ID` | ID Number |
| `rez_id` | Unique Reservation Value |
| `Status` | `"True"` = Result Successful |

---

## 5. Reservation Cancellation Service

**Endpoint:** `JsonCancel.aspx`

### Request Parameters

| Parameter | Description |
|-----------|-------------|
| `Key_Hack` | `[Key_Hack]` |
| `Rez_ID` | Reservation ID of the car |
| `ID` | Value Given to You When Registered |
| `User_Name` | Username provided to you |
| `User_Pass` | Password provided to you |

### Example URL

```
JsonCancel.aspx?Rez_ID=[Rez_ID]&User_Pass=[User_Pass]&Key_Hack=[Key_Hack]&User_Name=[User_Name]
```

### Return Values

| Field | Description |
|-------|-------------|
| `ID` | ID Number |
| `Status` | `"True"` = Successful |
