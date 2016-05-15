#!/bin/ruby
require 'csv'

def help
  puts "Usage:"
  puts "ruby transpose_csv.rb [INPUT_FILE] [SEPARATOR, (optional)]"
end

abort(help) if (ARGV[0].nil?

csv_matrix = []

CSV.foreach(ARGV[0]) do |row|
  csv_matrix << row
end

CSV.open("transpose_#{ARGV[0]}", "w") do |csv|
  csv_matrix.transpose.each do |row|
    csv << row
  end
end