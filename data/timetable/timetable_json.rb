require 'open-uri'
require 'nokogiri'

#時間割をパース
def makeTable(fileURL)
	days = ['mon','tue','wed','thu','fri','sat']
	doc = Nokogiri::HTML(open(fileURL))
	rString = '{"timetable":{'
	rString += '"url":"' + fileURL +'",'
	rString += '"title":"' + doc.css('table#mon td#CP font').text + '"'
	#曜日ごとの表
	for	tableId	in days do
		table = doc.css('table#' + tableId + ' table')
		rString += ',"' + tableId + '":['
		#教科名を含む行
		firstTr = 1
		table.css('tr[valign="TOP"]').each do |tr|
			if firstTr == 1
				firstTr = 0
			else
				rString += ','
			end
			rString += '[' 
			#列
			firstTd = 1
			tr.css('td').each do |td|
				if td['id'] == 'Dummy' || td['id'] == 'Subject'
					if firstTd == 1
						firstTd = 0
					else
						rString += ','
					end
				end
				if td['id'] == 'Dummy'
					rString += '{"subject":"","class":1}'
				elsif td['id'] == 'Subject'
					rString += '{"subject":"' + td.css('a').text.tr('０-９ａ-ｚＡ-Ｚ＆　', '0-9a-zA-Z& ') + '","class":' + td['colspan'] + '}'
					#2コマ以上の授業と配列の個数を合わせる
					for i in 2..td['colspan'].to_i
						rString += ',{"subject":"","class":1}'
					end
				end
			end
			rString += ']'
		end
		rString += ']'
	end
	rString += '}}'
	return rString
end

def makeFile()
	indexURL = "http://timetable.sic.shibaura-it.ac.jp"
	doc = Nokogiri::HTML(open(indexURL))
	#eng = doc.css('table > tr:nth-child(6) table#csize')
	#sys = doc.css('table > tr:nth-child(7) table#csize')
	#des = doc.css('table > tr:nth-child(8) table#csize')
	#学部
	dep = ['工学部', 'システム理工学部', 'デザイン工学部']
	#学部ループ
	for i in 6..8
		p dep[i - 6]
		#学科ループ
		doc.css('table > tr:nth-child(' + i.to_s + ') table#csize tr').each do |tr|
			department = tr.css('td:first-child')
			p department.text
			#リンク取得
			j = 0
			tr.css('a').each do |link|
				grade = j / 2 + 1
				sem = (j % 2) == 0 ? "A" : "B"


				


				p URI.join(indexURL, link['href']).to_s
				j += 1
			end
		end
	end
end

makeFile()
#print makeTable('http://timetable.sic.shibaura-it.ac.jp/table/2016/Timetable1A0013.html')


