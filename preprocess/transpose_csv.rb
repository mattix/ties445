#!/bin/ruby
require 'csv'

def help
  puts "Usage:"
  puts "ruby transpose_csv.rb [INPUT_FILE] [SEPARATOR, (optional)]"
end

abort(help) if ARGV[0].nil?

csv_matrix = []

options = {}

options[:col_sep] = ARGV[1] unless ARGV[1].nil?

CSV.foreach(ARGV[0], options) do |row|
  csv_matrix << row
end

CSV.open("transpose_#{ARGV[0]}", "w", options) do |csv|
  csv_matrix.transpose.each do |row|
    csv << row
  end
end