require 'open-uri'
require 'nokogiri'
require 'json'

#表をパース
def makeSyllabusList(fileURL)
	doc = Nokogiri::HTML(open(fileURL))
	i = 0
	syl = []
	doc.css('table tr[bgcolor="#FFFFEE"]').each do |tr|
		subject = tr.css('td:nth-child(2)')
		url = subject.css('a').map{|link| link['href']}[0]
		url = !url ? "" : url
		credit = tr.css('td:nth-child(3)')
		syl[i] = {}
		syl[i]['subject'] = subject.text.tr('０-９ａ-ｚＡ-Ｚ＆　', '0-9a-zA-Z& ')
		syl[i]['url'] = URI.join(fileURL,url).to_s
		syl[i]['credit'] = credit.text.to_i
		i += 1
	end
	return syl
end

#学科リストからファイルを生成
def makeFile()
	indexURL = "http://syllabus.sic.shibaura-it.ac.jp/syllabus/" + Time.now.year.to_s + "/"
	doc = Nokogiri::HTML(open(indexURL));
	#学部
	faculty = ['#ko', '#sys', '#de']
	jFaculty = ['工学部', 'システム理工学部', 'デザイン工学部']
	#学部ループ
	lData = {}
	lData['faculty'] = []
	i = 0
	for dep in faculty
		depNum = 0
		lData['faculty'][i] = {}
		lDataF = lData['faculty'][i]
		lDataF['name'] = jFaculty[i]
		lDataF['department'] = []
		#学科ループ
		doc.css(dep + ' table tr').each do |tr|
			rData = {}
			department = tr.css('td:first-child').text
			rData['title'] = department
			puts department + "を処理中..."
			lDataF['department'][depNum] = {}
			lDataFD = lDataF['department'][depNum]
			lDataFD['name'] = department
			#リンク取得
			rData['syllabus'] = []
			tr.css('a').each do |link|
				if link['title']
					rData['syllabus'].concat(makeSyllabusList(URI.join(indexURL, link['href']).to_s))
				end
			end
			folderPath = i.to_s  + "/"
			FileUtils.mkdir_p(folderPath) unless FileTest.exist?(folderPath)
			File.open(folderPath + depNum.to_s + ".json", "w") do |file|
  				file.print(JSON.generate(rData))
			end
			depNum += 1
		end
		i += 1
	end
	File.open("list.json", "w") do |file|
		file.print(JSON.generate(lData))
	end
	puts "シラバスデータの生成が完了しました。"
end

#総合科目などを科目別ファイルに統合
def integrate()
	#システム理工学部
	sys = "1"
	general = JSON.load(open(sys + "/0.json"))
	#学科
	for depNum in 2..7
		depFile = JSON.load(open(sys + "/" + depNum.to_s + ".json"))
		depFile["syllabus"] += general["syllabus"]
		File.open(sys + "/" + depNum.to_s + ".json", "w") do |file|
  			file.print(JSON.generate(depFile))
		end
	end


	#デザイン工学部
	des = "2"
	#共通教養
	general = JSON.load(open(des + "/0.json"))
	#共通基礎
	basic = JSON.load(open(des + "/2.json"))
	#共通専門
	pro = JSON.load(open(des + "/3.json"))
	for depNum in 5..8
		depFile = JSON.load(open(des + "/" + depNum.to_s + ".json"))
		depFile["syllabus"] += general["syllabus"]
		depFile["syllabus"] += basic["syllabus"]
		depFile["syllabus"] += pro["syllabus"]
		#timetableとファイル名の整合性を合わせる
		folderPath = des + "new/"
		FileUtils.mkdir_p(folderPath) unless FileTest.exist?(folderPath)		
		File.open(des + "new/" + (depNum-5).to_s + ".json", "w") do |file|
  			file.print(JSON.generate(depFile))
		end
	end
	#timetableとファイル名の整合性を合わせる
	#教職
	teacher = JSON.load(open(des + "/1.json"))
	File.open(des + "new/4.json", "w") do |file|
  		file.print(JSON.generate(teacher))
	end

	File::rename(des, des + "old")
	File::rename(des + "new", des)

end



#puts makeSyllabusList("http://syllabus.sic.shibaura-it.ac.jp/syllabus/2016/MatrixL01131.html")
makeFile()
integrate()

