import { IRepaymentData } from "../../services/repayment-calculator/repayment-calculator.types";

export interface IRowWithDescription extends Omit<IRepaymentData, 'date'> {
    description: string
}

export  type TAdditionalRowData = IRepaymentData | IRowWithDescription