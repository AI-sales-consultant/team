import pandas as pd
import json
import glob

def preprocess_data():
    """
    This function finds all client anwers(stored in a single CSV file) ,
    processes them, and saves the output in a JSONL file.
    """
    # Find all files ending with "Tips.csv"
    files = glob.glob('*Tips.csv')

    if not files:
        print("No 'Tips.csv' files found in the directory.")
        return

    answers_df = []
    question_counter = 0

    for file in files:
        try:
            # Load the data, skipping the first row of the CSV.
            df = pd.read_csv(file, header=1)

            # Rename columns for easier processing.
            df.columns = ['Question', 'Start_Doing', 'Do_More', 'Keep_Doing']

            # Melt the DataFrame to transform it into a long format.
            df_melted = df.melt(id_vars=['Question'], var_name='category', value_name='text')

            # Create the 'id' column.
            # We need to make sure the ID is unique for each question.
            # We'll use a counter that increments for each unique question.
            for i in range(len(df)):
                df_melted.loc[df_melted['Question'] == df.iloc[i]['Question'], 'id'] = f"question_{question_counter:02d}"
                question_counter += 1

            # Reorder columns and select the desired ones.
            df_final = df_melted[['id', 'category', 'text']]

            answers_df.append(df_final)

            print(f"Processed file: {file}")

        except Exception as e:
            print(f"An error occurred while processing {file}: {e}. Skipping this file.")

    if answers_df:
        # Concatenate all DataFrames into a single DataFrame.
        final_df = pd.concat(answers_df, ignore_index=True)

        # Write the final DataFrame to a JSONL file.
        output_filename = 'answers.jsonl'
        with open(output_filename, 'w') as f:
            for _, row in final_df.iterrows():
                f.write(json.dumps(row.to_dict()) + '\n')

        print(f"\nSuccessfully created '{output_filename}'")
    else:
        print("\nNo data was processed.")

if __name__ == '__main__':
    preprocess_data()