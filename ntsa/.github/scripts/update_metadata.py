import json
from datetime import datetime
import os
import glob

def update_metadata():
    # 활성 유저 데이터 파일 경로
    data_file = 'data/users/active.json'
    
    # 파일이 존재하는지 확인
    if not os.path.exists(data_file):
        print(f"Error: {data_file} not found")
        return
    
    try:
        # JSON 파일 읽기
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 현재 UTC 시간
        current_time = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        
        # 총 레코드 수 계산
        total_records = len(data.get('users', {}))
        
        # 메타데이터 업데이트
        data['meta'] = {
            'last_updated': current_time,
            'total_records': total_records,
            'file_size': os.path.getsize(data_file),
            'monthly_reports': count_monthly_reports(data),
            'status_summary': get_status_summary(data)
        }
        
        # 파일 다시 쓰기
        with open(data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print("Metadata updated successfully")
        
    except Exception as e:
        print(f"Error updating metadata: {str(e)}")

def count_monthly_reports(data):
    """현재 달의 리포트 수를 계산"""
    current_month = datetime.utcnow().strftime("%Y-%m")
    count = 0
    
    for user_data in data.get('users', {}).values():
        for report in user_data.get('reports', []):
            report_date = report['timestamp'][:7]  # YYYY-MM
            if report_date == current_month:
                count += 1
                
    return count

def get_status_summary(data):
    """상태별 유저 수 요약"""
    summary = {
        'WARNING': 0,
        'DANGEROUS': 0,
        'NORMAL': 0
    }
    
    for user_data in data.get('users', {}).values():
        status = user_data.get('status', {}).get('level', 'NORMAL')
        summary[status] = summary.get(status, 0) + 1
        
    return summary

if __name__ == '__main__':
    update_metadata()
