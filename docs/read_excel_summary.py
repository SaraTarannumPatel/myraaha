import os
import pandas as pd
import glob
import sys

directory = r"f:\Invincx Projects\myraaha-dev\docs\17 SECTORS WITH THEIR 17000+ JOB ROLES"
excel_files = glob.glob(os.path.join(directory, "*.xlsx"))

print(f"Found {len(excel_files)} Excel files.\n")

total_rows = 0
all_columns = set()

for file in excel_files:
    try:
        xls = pd.ExcelFile(file)
        sheet_names = xls.sheet_names
        print(f"[{os.path.basename(file)}]")
        
        for sheet in sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet)
            rows = len(df)
            total_rows += rows
            cols = list(df.columns)
            all_columns.update(cols)
            print(f"  - Sheet '{sheet}': {rows} rows")
            
            # Print a single sample row from the first file we successfully read
            if total_rows == rows and rows > 0:
                print(f"    -> Sample Columns: {cols[:8]}...")
                print(f"    -> Sample Row 1: {df.iloc[0].to_dict()}")
                
    except Exception as e:
        print(f"Error reading {file}: {e}")

print("\n" + "="*50)
print(f"TOTAL ROWS SCANNED: {total_rows}")
print(f"ALL UNIQUE COLUMNS: {sorted(list(all_columns))}")
