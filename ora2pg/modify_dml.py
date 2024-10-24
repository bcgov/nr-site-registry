import re

# Define the input and output file paths
input_file_path = 'data/output.sql'
output_file_path = 'data/output_new.sql'

def convert_st_geometry_to_value(sql_statement):
    # Replace INSERT INTO with INSERT INTO sites.
    # This is done to include the schema name in the insert scripts generated by ora2pg
    modified_sql = sql_statement.replace("INSERT INTO ", "INSERT INTO sites.")
    return modified_sql


# Open the input and output files
with open(input_file_path, 'r') as input_file, open(output_file_path, 'w') as output_file:
    # Read the input file line by line
    for line in input_file:
        # Check if the line contains an INSERT statement
        if line.startswith('INSERT INTO'):
            # Call the function to convert ST_Geometry() to value
            output_sql = convert_st_geometry_to_value(line)
            output_file.write(output_sql)
        else:
            # Write non-INSERT lines to the output file as is
            output_file.write(line)

# Print a message indicating the process is complete
print("Insert statements modified and written to:", output_file_path)
