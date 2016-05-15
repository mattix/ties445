#!/bin/ruby
abort("No filename given or file does not exist") if (ARGV[0].nil? || !File.exist?(ARGV[0]))

csv_matrix = []

CSV.foreach(ARGV[0]) do |row|
  csv_matrix << row
end

CSV.open("transpose_#{ARGV[0]}", "w") do |csv|
  csv_matrix.transpose.each do |row|
    csv << row
  end
end