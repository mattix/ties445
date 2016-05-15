#!/bin/ruby
require 'csv'

def numeric(string)
  string.match(/\A[+-]?\d+?(_?\d+)*(\.\d+e?\d*)?\Z/) == nil ? false : true
end

def read_ranged_csv(file)
  fixed_csv = []
  headers = true

  CSV.foreach(file, col_sep: ";", encoding: "ISO8859-1") do |row|
    row_array = []
    if headers
      i = 0
      row.each do |element|
        unless element.nil?
          start_year = element.split('-')[0].to_i
          5.times do |j|
            row_array[i * 5 + j - 4] = start_year + j
          end
        end
        i += 1
      end
      headers = false
    else
      i = 0
      row_array << row[0].encode('utf-8')
      for i in 1..(row.length - 1)
        unless numeric(row[i])
          5.times do
            row_array << row[i]
          end
        else
          start_value = row[i + 1].to_f
          step = (start_value - row[i].to_f) / 5.0
          5.times do |j|
            value_index = i * 5 + j - 4
            row_array[value_index] = (start_value + j * step).round(1)
            if row_array[value_index] < 0.0
              row_array[value_index] = 0.0
            end
          end
        end
        i += 1
      end
    end
    fixed_csv << row_array
  end
  fixed_csv
end

def append_csv(file, merged_csv)
  headers = true
  header_length = merged_csv[0].length

  CSV.foreach(file, col_sep: ";", encoding: "ISO8859-1") do |row|
    if headers
      i = 0
      row.each do |element|
        unless element.nil?
          merged_csv[0] << element.to_i
        end
      end
      headers = false
    else
      # TODO Strip codes and match with previous lines
      line_header = row[0].encode('utf-8')
      row_array = []
      row_array << line_header
      (header_length - 1).times do
        row_array << nil
      end
      row.drop(1).each do |element|
        unless numeric(element)
          row_array << element
        else
          row_array << element.to_f
        end
      end
      merged_csv << row_array
      
    end
  end
end

merged_csv = []

merged_csv = read_ranged_csv("../csv/1891-1950-1.csv")
append_csv("../csv/1951-1968.csv", merged_csv)
append_csv("../csv/1969-1985.csv", merged_csv)
#append_csv("../csv/1988-1995.csv", merged_csv)

CSV.open("../csv/merged_1891-1985.csv", "w", {:col_sep => ";"}) do |csv|
  merged_csv.each do |row|
    csv << row
  end
end