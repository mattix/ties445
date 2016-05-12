clear;
CSV1 = dlmread('../csv/1891-1950.csv', ';');
[l, w] = size(CSV1);

FIXED = eye(l, w * 5 - 4);

FIXED(1,1) = 2;

% Fix headers
for i = 2:w
  years = strsplit(strrep(num2str(CSV1(1,i)), 'i', ''), '-');
  for j = 1:5
    indx = ((i - 1) * 5 - 4) + j;
    FIXED(1, indx) = str2num(years{1}) + j - 1;
  end
end

for i = 2:l
  FIXED(i, 1) = CSV1(i, 1);
  for j = 2 : w - 1
    start_value = CSV1(i, j); end_value = CSV1(i, j + 1);
    c = (j * 5 - 4); s = (end_value - start_value) / 5.0;
    for h = 1:5
      FIXED(i, c + h) = start_value + (h - 1) * s;
    end
  end
end
