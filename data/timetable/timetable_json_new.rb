require 'open-uri'
require 'nokogiri'
require 'json'


$days = ['mon','tue','wed','thu','fri','sat']
#時間割をパース
def makeTable(fileURL)
	doc = Nokogiri::HTML(open(fileURL))
	rData = {}
	rData['url'] = fileURL
	#曜日ごとの表
	for	tableId	in $days do
		table = doc.css('table#' + tableId + ' table')
		rData[tableId] = []
		#教科名を含む行
		i = 0
		table.css('tr[valign="TOP"]').each do |tr|
			rData[tableId][i] = []
			rDataTr = rData[tableId][i]
			#列
			j = 0
			tr.css('td').each do |td|
				numClass = td['colspan'].nil? ? 1 : td['colspan'].to_i
				if td['id'] == 'Dummy'
					rDataTr[j] = {}
					rDataTr[j]['subject'] = ''
					rDataTr[j]['class'] = 1
				j += numClass
				elsif td['id'] == 'Subject'
					rDataTr[j] = {}
					rDataTr[j]['subject'] = td.css('a').text.tr('０-９ａ-ｚＡ-Ｚ＆　', '0-9a-zA-Z& ')
					rDataTr[j]['class'] = td['colspan'].to_i
					#2コマ以上の授業と配列の個数を合わせる
					for k in 2..numClass
						rDataTr[j + k - 1] = {}
						rDataTr[j + k - 1]['subject'] = ''
						rDataTr[j + k - 1]['class'] = 1
					end
				j += numClass
				end
			end
			i += 1
		end
	end
	return rData
end

def makeFile()
	indexURL = "http://timetable.sic.shibaura-it.ac.jp"
	doc = Nokogiri::HTML(open(indexURL))
	#eng = doc.css('table > tr:nth-child(6) table#csize')
	#sys = doc.css('table > tr:nth-child(7) table#csize')
	#des = doc.css('table > tr:nth-child(8) table#csize')
	#学部
	faculty = ['工学部', 'システム理工学部', 'デザイン工学部']
	#学部ループ
	lData = {}
	lData['faculty'] = []
	for i in 6..8
		depNum = 0
		lData['faculty'][i - 6] = {}
		lDataF = lData['faculty'][i-6]
		lDataF['name'] = faculty[i - 6]
		lDataF['department'] = []
		#学科ループ
		doc.css('table > tr:nth-child(' + i.to_s + ') table#csize tr').each do |tr|
			department = tr.css('td:first-child')
			puts faculty[i - 6] + department.text + "を処理中..."
			#Is this department?
			isDep = department.text.include?('学科') || department.text.include?('デザイン')
			lDataF['department'][depNum] = {}
			lDataFD = lDataF['department'][depNum]
			lDataFD['name'] = department.text
			lDataFD['isDep'] = isDep
			rData = {}
			rData['title'] = faculty[i - 6] + department.text
			rData['timetable'] = {}
			#リンク取得
			j = 0
			tr.css('a').each do |link|
				grade = j / 2 + 1
				sem = (j % 2) == 0 ? "A" : "B"
				rData['timetable'].store(grade.to_s + sem, makeTable(URI.join(indexURL, link['href']).to_s))
				j += 1
			end
			folderPath = (i - 6).to_s + "/"
			FileUtils.mkdir_p(folderPath) unless FileTest.exist?(folderPath)
			File.open(folderPath + depNum.to_s + ".json", "w") do |file|
  				file.print(JSON.generate(rData))
			end
			depNum += 1
		end
	end
	File.open("list.json", "w") do |file|
		file.print(JSON.generate(lData))
	end
	puts "時間割データの生成が完了しました。"
end


def integrate()
	#システム理工学部
	sys = "1"
	general = JSON.load(open(sys + "/0.json"))
	#学科
	for depNum in 2..7
		depFile = JSON.load(open(sys + "/" + depNum.to_s + ".json"))
		table = depFile['timetable']
		#学年学期
		for gradeGen in general['timetable']
			#曜日
			gradeDep = table["#{gradeGen[0]}"]
			for day in $days
				gradeDep["#{day}"] += gradeGen[1]["#{day}"]
			end
		end
		File.open(sys + "/" + depNum.to_s + ".json", "w") do |file|
  			file.print(JSON.generate(depFile))
		end
	end
end


makeFile()
integrate()


