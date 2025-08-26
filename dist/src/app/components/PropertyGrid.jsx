"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const propertyCard_1 = __importDefault(require("./propertyCard"));
const PropertiesGrid = ({ items, }) => {
    return (<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:hidden">
            {items.map((p) => (<propertyCard_1.default key={p.id} p={p}/>))}
        </div>);
};
exports.default = PropertiesGrid;
